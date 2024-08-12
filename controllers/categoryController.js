const Category = require("../models/categoryModel");

// add category

const addCategory = async (req, res) => {

  try {

    let inpValue = req.query.inp
    let namee = req.query.name
    let radioo = req.query.radio

    

    if (inpValue) {

      const catecheck = await Category.findOne({

        name: { $regex: new RegExp("^" + req.query.inp + "$", "i") },

      });

      if (catecheck) {

        res.send({ inp: true });

      } else {

        res.send({ inp: false });

      }

    } else if (namee && radioo) {

      const addCate = new Category({

        name: namee,
        is_listed: radioo,

      });

      addCate.save();

      res.send({ true: true });
    }

  } catch (error) {
    console.log(error.message);
  }
};

// edit categor

const editCategory = async (req, res) => {

  try {

    const cateId = req.query.id;
    const newName = req.query.value.trim();

    

    //checking existing one

    const datacheck = await Category.findOne({

      name: { $regex: new RegExp("^" + newName + "$", "i") },

    });

    if (datacheck) {

      res.send({ error: "Category already exist" });

    } else {

      const updatedcate = await Category.findByIdAndUpdate(

        { _id: cateId },

        { $set: { name: newName } }

      );

      updatedcate.save();
      res.send(true);

    }

  } catch (error) {

    console.log(error);

  }

};

// category action

const categoryAction = async (req, res) => {
  try {
    const cateId = req.query.id;

    

    const listed = await Category.findOne({ _id: cateId });

    listed.is_listed = !listed.is_listed;

    listed.save();

    res.send({ set: true });
  } catch (error) {
    console.log(error.message);
  }
};






module.exports = {
  addCategory,
  editCategory,
  categoryAction
};