import foodModel from "../models/foodModel.js";

export const addFood = async (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: "Image file is required!" });
  }

  const image_filename = req.file.filename;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added Successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding food" });
  }
};

export const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, foods });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFood = async (req, res) => {
  try {
    const removed = await foodModel.findByIdAndDelete(req.params.foodId);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }

    return res.status(200).json({ success: true, message: "Food removed." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
