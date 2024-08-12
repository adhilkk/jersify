const category = require("../models/categoryModel");
const Products = require("../models/product");
const fs = require("fs");
const path = require("path");


// load products

const loadProducts = async (req, res) => {
  try {
    
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    
    const totalCatCount = await Products.countDocuments();
    const totalPages = Math.ceil(totalCatCount / limit);
    
    const productsData = await Products.find().populate("category")
    
    .skip(skip)
    .limit(limit);
    
    
    

    res.render("admin/product", { currentPage: page, totalPages, productsData });
  } catch (error) {
    console.log(error.message);
  }
};

// add products get

const loadAddproduct = async (req, res) => {
  try {
    const listcategory = await category.find({ is_listed: true });
    

    res.render("admin/addproduct", { listcategory,});
  } catch (error) {
    console.log(error.message);
  }
};

// add producrts post

const addProducts = async (req, res) => {

  try {

    

    let images = [];

    const image = req.files;
    

    image.forEach((file) => {

      images.push(file.filename);

    });

   

    const currentDate = Date();
    const categories = await category.findOne({ name: req.body.category });

    const offerPorice = req.body.Discountprice ? Math.round((req.body.price / 100) * (100 - req.body.Discountprice)) : 0


  


    const product = Products.create({
      name: req.body.product,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      category: categories._id,
      image: images,
      discount:req.body.Discountprice,
      dis_price : offerPorice,
      description: req.body.description,
      createdAt: currentDate,
      status: req.body.radio,
    });

    

    

    res.redirect("/admin/products");

  } catch (error) {
    console.log(error.message)
  }
};
//show edit product edit

const loadeditProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const listcategory = await category.find({ is_listed: true });
    const productsData = await Products.findById({ _id: productId });
    
    res.render("admin/productEdit", { productsData,listcategory });
  } catch (error) {}
};

// product list
const productStatus = async (req, res) => {

  try {

    const productId = req.query.id;

    const productStatus = await Products.findOne({ _id: productId });

    productStatus.status = !productStatus.status;

    productStatus.save();
    
    res.send({ set: true });

  } catch (error) {

    throw error;

  }
};

// edit product

const editProduct = async (req, res) => {
try {
 

    const produt= await Products.findOne({_id:req.params.id});
    const {product,price,Discountprice,stock,description,category,brand}=req.body;


   
    
    



    let imag=[];

for (let i = 0; i < 3; i++) {
    const key = `k${i}`;
    if (req.body[key]) {

      imag.push(produt.image[i]);
    } else {
        imag.push(req.files[`image${i}`][0].filename);
        fs.unlinkSync(path.join(__dirname,'../public/productImage',produt.image[i]))
    }
}
    produt.image=imag;

    const offerPorice = Math.round((price / 100) * (100 - Discountprice));

    await Products.findOneAndUpdate({_id:req.params.id},{$set:{name:product,price:price,discount:Discountprice,stock:stock,description:description,image:imag , dis_price : offerPorice,category:category,brand:brand}})
    produt.save()
    res.redirect('/admin/products')
    
} catch (error) {
  console.log(error.message)
}
  
};

module.exports = {
  loadProducts,
  addProducts,
  loadAddproduct,
  loadeditProduct,
  productStatus,
  editProduct,
};