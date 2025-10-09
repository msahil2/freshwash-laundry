const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { category, search, sortBy = 'name', order = 'asc' } = req.query;
  
  let query = Service.find({ isActive: true });

  // Filter by category
  if (category && category !== 'all') {
    query = query.find({ category });
  }

  // Search functionality
  if (search) {
    query = query.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Sorting
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortOptions = {};
  
  switch (sortBy) {
    case 'name':
      sortOptions.name = sortOrder;
      break;
    case 'category':
      sortOptions.category = sortOrder;
      break;
    case 'price':
      // This is complex for services with multiple price points
      sortOptions.createdAt = sortOrder;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  query = query.sort(sortOptions);

  const services = await query;

  res.json({
    success: true,
    count: services.length,
    services
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (service && service.isActive) {
    res.json({
      success: true,
      service
    });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const services = await Service.find({ 
    category: { $regex: new RegExp(category, 'i') },
    isActive: true 
  }).sort({ name: 1 });

  res.json({
    success: true,
    count: services.length,
    category,
    services
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const {
    name,
    description,
    category,
    services,
    image,
    minQuantity,
    maxQuantity,
    estimatedTime,
    specialInstructions
  } = req.body;

  const serviceExists = await Service.findOne({ name });

  if (serviceExists) {
    res.status(400);
    throw new Error('Service with this name already exists');
  }

  const service = await Service.create({
    name,
    description,
    category,
    services,
    image,
    minQuantity,
    maxQuantity,
    estimatedTime,
    specialInstructions
  });

  res.status(201).json({
    success: true,
    service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const service = await Service.findById(req.params.id);

  if (service) {
    const {
      name,
      description,
      category,
      services,
      image,
      minQuantity,
      maxQuantity,
      estimatedTime,
      specialInstructions,
      isActive
    } = req.body;

    service.name = name || service.name;
    service.description = description || service.description;
    service.category = category || service.category;
    service.services = services || service.services;
    service.image = image || service.image;
    service.minQuantity = minQuantity || service.minQuantity;
    service.maxQuantity = maxQuantity || service.maxQuantity;
    service.estimatedTime = estimatedTime || service.estimatedTime;
    service.specialInstructions = specialInstructions || service.specialInstructions;
    service.isActive = isActive !== undefined ? isActive : service.isActive;

    const updatedService = await service.save();

    res.json({
      success: true,
      service: updatedService
    });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (service) {
    // Soft delete - set isActive to false instead of removing
    service.isActive = false;
    await service.save();

    res.json({
      success: true,
      message: 'Service removed'
    });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await Service.distinct('category', { isActive: true });
  
  res.json({
    success: true,
    categories
  });
});

module.exports = {
  getServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
  getServiceCategories
};