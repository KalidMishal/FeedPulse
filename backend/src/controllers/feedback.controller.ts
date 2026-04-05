import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { analyzeFeedback, generateWeeklySummary } from '../services/gemini.service';
import { z } from 'zod';

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    // 4.5 Input sanitisation and validation using Zod
    const generateFeedbackSchema = z.object({
      title: z.string().min(1, 'Title is required').trim().max(100, 'Title is too long'),
      description: z.string().min(20, 'Description must be at least 20 characters long').trim().max(2000, 'Description is too long'),
      category: z.string().optional(),
      submitterName: z.string().optional(),
      submitterEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    });

    const validationResult = generateFeedbackSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({ 
        success: false, 
        error: validationResult.error.issues.map(e => e.message).join(', ') 
      });
      return;
    }

    const { title, description, category, submitterName, submitterEmail } = validationResult.data;

    const aiAnalysis = await analyzeFeedback(title, description);

    const feedback = new Feedback({
      title,
      description,
      category: category || 'Other',
      submitterName,
      submitterEmail,
      ai_category: aiAnalysis.category,
      ai_sentiment: aiAnalysis.sentiment,
      ai_priority: aiAnalysis.priority_score,
      ai_summary: aiAnalysis.summary,
      ai_tags: aiAnalysis.tags,
      ai_processed: aiAnalysis.success || false,
    });

    await feedback.save();

    res.status(201).json({ success: true, data: feedback, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({ success: false, error: 'Server error while submitting feedback' });
  }
};

export const getFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, sortBy, search, limit = 10, page = 1 } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'priority') sortOption = { ai_priority: -1 };
    else if (sortBy === 'date_asc') sortOption = { createdAt: 1 };
    else if (sortBy === 'sentiment') sortOption = { ai_sentiment: -1 };

    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);

    const feedback = await Feedback.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching feedback' });
  }
};

export const getFeedbackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      res.status(404).json({ success: false, error: 'Feedback not found' });
      return;
    }
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['New', 'In Review', 'Resolved'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      res.status(404).json({ success: false, error: 'Feedback not found' });
      return;
    }
    res.status(200).json({ success: true, data: feedback, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error modifying status' });
  }
};

export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      res.status(404).json({ success: false, error: 'Feedback not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting feedback' });
  }
};

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFeedback = await Feedback.find({ createdAt: { $gte: thirtyDaysAgo } });

    const total = recentFeedback.length;
    const openItems = recentFeedback.filter(f => f.status !== 'Resolved').length;
    const avgPriority = total > 0 
      ? recentFeedback.reduce((sum, f) => sum + (f.ai_priority || 0), 0) / total 
      : 0;
    
    // Tag counting
    const tagCounts: Record<string, number> = {};
    recentFeedback.forEach(f => {
      f.ai_tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const mostCommonTag = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    res.status(200).json({
      success: true,
      data: {
        total,
        openItems,
        avgPriority: avgPriority.toFixed(1),
        mostCommonTag,
      },
      message: 'Summary calculated successfully'
    });
  } catch (error) {
    console.error('getSummary Error:', error);
    res.status(500).json({ success: false, error: 'Server error calculating summary' });
  }
};

export const getAISummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedback = await Feedback.find({ createdAt: { $gte: sevenDaysAgo } });

    const aiText = await generateWeeklySummary(recentFeedback);

    res.status(200).json({
      success: true,
      data: aiText,
      message: 'AI Summary generated successfully'
    });
  } catch (error) {
    console.error('getAISummary Error:', error);
    res.status(500).json({ success: false, error: 'Server error calculating AI summary' });
  }
};

export const reanalyzeFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      res.status(404).json({ success: false, error: 'Feedback not found' });
      return;
    }

    const aiAnalysis = await analyzeFeedback(feedback.title, feedback.description);

    feedback.ai_category = aiAnalysis.category;
    feedback.ai_sentiment = aiAnalysis.sentiment;
    feedback.ai_priority = aiAnalysis.priority_score;
    feedback.ai_summary = aiAnalysis.summary;
    feedback.ai_tags = aiAnalysis.tags;
    feedback.ai_processed = aiAnalysis.success || false;

    await feedback.save();

    res.status(200).json({ success: true, data: feedback, message: 'Feedback re-analyzed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error re-analyzing feedback' });
  }
};
