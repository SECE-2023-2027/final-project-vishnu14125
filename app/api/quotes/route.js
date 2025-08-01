import { NextResponse } from 'next/server';
import connectDB from '../../../db/connection.js';
import Quote from '../../../db/Quote.js';
import { isValidDate } from '../../../lib/dateUtils.js';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const sortBy = searchParams.get('sortBy') || 'date';
    const order = searchParams.get('order') || 'desc';

    let query = {};
    
    // Filter by specific date
    if (date) {
      if (!isValidDate(date)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      query.date = date;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in text and author
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query
    const quotes = await Quote.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Quote.countDocuments(query);

    // Convert MongoDB ObjectIds to strings
    const serializedQuotes = quotes.map(quote => ({
      ...quote,
      _id: quote._id.toString(),
    }));

    return NextResponse.json({
      quotes: serializedQuotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Quotes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { text, author, date, category = 'general', isQuoteOfTheWeek = false } = body;

    // Validation
    if (!text || !author || !date) {
      return NextResponse.json(
        { error: 'Text, author, and date are required' },
        { status: 400 }
      );
    }

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if quote already exists for this date
    const existingQuote = await Quote.findOne({ date });
    if (existingQuote) {
      return NextResponse.json(
        { error: 'A quote already exists for this date' },
        { status: 409 }
      );
    }

    // If setting as quote of the week, remove the flag from other quotes
    if (isQuoteOfTheWeek) {
      await Quote.updateMany(
        { isQuoteOfTheWeek: true },
        { isQuoteOfTheWeek: false }
      );
    }

    // Create new quote
    const newQuote = await Quote.create({
      text: text.trim(),
      author: author.trim(),
      date,
      category: category.trim(),
      isQuoteOfTheWeek,
    });

    const serializedQuote = {
      ...newQuote.toObject(),
      _id: newQuote._id.toString(),
    };

    return NextResponse.json(
      { 
        message: 'Quote created successfully',
        quote: serializedQuote
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create quote error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A quote already exists for this date' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
