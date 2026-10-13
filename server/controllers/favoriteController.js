const Favorite = require('../models/Favorite');

// @desc    Get user favorites
// @route   GET /api/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new favorite
// @route   POST /api/favorites
exports.addFavorite = async (req, res, next) => {
  try {
    const { type, title, description, data } = req.body;

    const favorite = await Favorite.create({
      user: req.user.id,
      type,
      title,
      description,
      data
    });

    res.status(201).json({
      success: true,
      favorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove favorite
// @route   DELETE /api/favorites/:id
exports.removeFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ _id: req.params.id, user: req.user.id });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    await favorite.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};
