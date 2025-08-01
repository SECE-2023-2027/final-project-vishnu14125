import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../db/connection.js';
import User from '../../../db/User.js';
import Quote from '../../../db/Quote.js';
import { authOptions } from '../../../auth/authConfig.js';
import { isValidDate } from '../../../lib/dateUtils.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get favorite quotes with full quote data
    const favoriteQuotes = await Quote.find({
      date: { $in: user.favorites }
    }).sort({ date: -1 }).lean();

    // Convert MongoDB ObjectIds to strings
    const serializedQuotes = favoriteQuotes.map(quote => ({
      ...quote,
      _id: quote._id.toString(),
    }));

    return NextResponse.json({
      favorites: user.favorites,
      quotes: serializedQuotes,
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body;

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { error: 'Valid date is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if quote exists
    const quote = await Quote.findOne({ date });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const isFavorite = user.favorites.includes(date);
    
    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(fav => fav !== date);
    } else {
      // Add to favorites
      user.favorites.push(date);
    }

    await user.save();

    return NextResponse.json({
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { error: 'Valid date is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(fav => fav !== date);
    await user.save();

    return NextResponse.json({
      message: 'Removed from favorites',
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
