import Theatre from '../models/Theatre.js';

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
export const getTheatres = async (req, res, next) => {
    try {
        const theatres = await Theatre.find({});
        res.json(theatres);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
export const createTheatre = async (req, res, next) => {
    try {
        const { name, city, address, facilities } = req.body;

        const theatre = new Theatre({
            name,
            city,
            address,
            facilities: facilities ? JSON.parse(facilities) : [],
        });

        const createdTheatre = await theatre.save();
        res.status(201).json(createdTheatre);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
export const updateTheatre = async (req, res, next) => {
    try {
        const { name, city, address, facilities, isActive } = req.body;

        const theatre = await Theatre.findById(req.params.id);

        if (theatre) {
            theatre.name = name || theatre.name;
            theatre.city = city || theatre.city;
            theatre.address = address || theatre.address;
            theatre.facilities = facilities ? JSON.parse(facilities) : theatre.facilities;
            if (isActive !== undefined) {
                theatre.isActive = isActive;
            }

            const updatedTheatre = await theatre.save();
            res.json(updatedTheatre);
        } else {
            res.status(404);
            return next(new Error('Theatre not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
export const deleteTheatre = async (req, res, next) => {
    try {
        const theatre = await Theatre.findById(req.params.id);

        if (theatre) {
            await Theatre.deleteOne({ _id: theatre._id });
            res.json({ message: 'Theatre removed' });
        } else {
            res.status(404);
            return next(new Error('Theatre not found'));
        }
    } catch (error) {
        next(error);
    }
};
