const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/favourites [PROTECTED]
router.get('/', auth, async (req, res, next) => {
  try {
    const favourites = await db.getFavouritesByUserId(req.user.userId);
    res.status(200).json(favourites);
  } catch (err) {
    next(err);
  }
});

// POST /api/favourites [PROTECTED]
router.post('/', auth, async (req, res, next) => {
  try {
    const { propertyId, address, price, imageUrl } = req.body;

    // Validate
    if (!propertyId || !address) {
      return res.status(400).json({ error: 'Property ID and address are required.' });
    }

    try {
      const newFavourite = await db.addFavourite(
        req.user.userId,
        propertyId,
        address,
        price,
        imageUrl
      );
      res.status(201).json({
        message: 'Added to favourites.',
        favourite: newFavourite
      });
    } catch (err) {
      // Check for UNIQUE constraint error (SQLite error code 19)
      if (err.errno === 19 || err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'Already in your favourites.' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favourites/:propertyId [PROTECTED]
router.delete('/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const result = await db.removeFavourite(req.user.userId, propertyId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Favourite not found.' });
    }

    res.status(200).json({ message: 'Removed from favourites.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
