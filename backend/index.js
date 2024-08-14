const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs= require("fs");
const path =require("path");
const multer = require('multer');
const app = express();
const port = 3006;

app.use(bodyParser.json());
app.use(cors());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Chaitanya@2111",
  database: "rautdb",
};

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then((connection) => {
    console.log("Connected to database");
    connection.release();
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
  });


  app.get("/api/stockdetails", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(` SELECT
    r.productName,
    ISNULL(SUM(r.quantity),0) AS receivedQuantity,
    ISNULL((SELECT SUM(i.quantity) FROM IssueMaterial i WHERE i.productName = r.productName),0) AS issuedQuantity,
    ISNULL(SUM(r.quantity),0) - ISNULL((SELECT SUM(i.quantity) FROM IssueMaterial i WHERE i.productName = r.productName),0) AS remainingQuantity FROM ReceiveMaterial r GROUP BY r.productName
    `);
    res.status(200).send(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching inventory data");
    }
  });

// Route to handle form submission
app.post('/api/00', (req, res) => {
  const {
      location,
      supplierName,
      billingAddress,
      shippingAddress,
      purchaseOrder,
      purchaseReference,
      deliveryDate,
      purchaseOrderType,
      rows, // This should be an array of objects containing item details
      freightCharges,
      igst,
      otherCharges,
      discount,
      grandTotal
  } = req.body;

  // Prepare the data for insertion into MySQL
  const values = [
      location,
      supplierName,
      billingAddress,
      shippingAddress,
      purchaseOrder,
      purchaseReference,
      deliveryDate,
      purchaseOrderType,
      JSON.stringify(rows), // Assuming rows is an array of objects; JSON.stringify converts it to a string
      freightCharges,
      igst,
      otherCharges,
      discount,
      grandTotal
  ];

  // SQL query with prepared statement
  const sql = `INSERT INTO purchases 
               (location, supplierName, billingAddress, shippingAddress, purchaseOrder, purchaseReference, 
               deliveryDate, purchaseOrderType, itemDetails, freightCharges, igst, otherCharges, 
               totalDiscountPercentage, grandTotal) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Execute the query
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error saving data:', err);
          res.status(500).send('Error saving data');
      } else {
          console.log('Data saved successfully');
          res.status(200).send('Data saved successfully');
      }
  });
});




app.get('/api/suppliers', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT supplier_name, billing_address,billing_street,billing_city,billing_state,billing_country,billing_zip,shipping_zip,shipping_country,shipping_state,shipping_city,shipping_street, shipping_address FROM suppliertable');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliers', error);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});







// app.post("/api/purchase", async (req, res) => {
//   const {
//     supplierName,
//     billingAddress,
//     shippingAddress,
//     purchaseOrder,
//     reference,
//     deliveryDate,
//     purchaseOrderType,
//     location,
//     tableData,
//     otherCharges,
//     igstPercentage,
//     discountPercentage,
//     grandTotal
//   } = req.body;

//   let connection;
//   try {
//     // Begin transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Initialize subTotal
//     let subTotal = 0;

//     // Insert each row into the Purchase table
//     const insertQuery = `
//       INSERT INTO Purchase 
//       (SupplierName, BillingAddress, ShippingAddress, PurchaseOrder, Reference, DeliveryDate, PurchaseOrderType, Location, ParentCode, ParentDescription, Quantity, UOM, Rate, Amount,  GSTPercentage, DeliveryMessage, OtherCharges, IGSTPercentage, DiscountPercentage, SubTotal, GrandTotal) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const insertPromises = tableData.map((item) => {
//       // Calculate amount for each item and add to subTotal
//       const amount = item.quantity * item.rate;
//       subTotal += amount;

//       return connection.query(insertQuery, [
//         supplierName, billingAddress, shippingAddress, purchaseOrder, reference, deliveryDate, purchaseOrderType, location,
//         item.productCode, item.productDescription, item.quantity, item.uom, item.rate,
//         amount, item.gstPercentage, item.deliveryMessage,
//         otherCharges, igstPercentage, discountPercentage, subTotal, grandTotal
//       ]);
//     });

//     // Execute all insertion queries
//     await Promise.all(insertPromises);

//     // Commit transaction
//     await connection.commit();
//     res.status(201).json({ success: true, message: "Purchase order submitted successfully" });
//   } catch (error) {
//     // Rollback transaction on error
//     if (connection) {
//       await connection.rollback();
//     }
//     console.error("Error submitting purchase order", error);
//     res.status(500).json({ success: false, message: "Failed to submit purchase order" });
//   } finally {
//     // Release connection back to the pool
//     if (connection) {
//       connection.release();
//     }
//   }
// });






app.get('/api/productcode', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT itemcode, uom, tax, price FROM finishgoods');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching finishgoods', error);
    res.status(500).json({ message: 'Failed to fetch finishgoods' });
  }
});


app.get('/api/product-details/:itemcode', async (req, res) => {
  const { itemcode } = req.params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT itemdescription, uom, price, tax FROM finishgoods WHERE itemcode = ?', [itemcode]);
    connection.release();
    if (rows.length > 0) {
      res.json(rows[0]); // Assuming itemcode is unique, return the first row
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
});



const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  limits: { files: 5 } // Limit to 5 files per request
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// app.post("/api/purchase",upload.fields([
//   { name: 'fileuplod', maxCount: 5 },

// ]), async (req, res) => {
//   const {
//     supplierName,
//     billingAddress,
//     shippingAddress,
//     purchaseOrder,
//     reference,
//     deliveryDate,
//     purchaseOrderType,
//     location,
//     tableData: tableDataString, // Receive as a string
//     otherCharges,
//     igstPercentage,
//     discountPercentage,
//     grandTotal,
//     note,  // Added note field
//   } = req.body;

//   // Parse tableData from JSON string to an array
//   const tableData = JSON.parse(tableDataString);

//   const attachment = req.file; // Uploaded file object

//   let connection;
//   try {
//     // Begin transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Initialize subTotal
//     let subTotal = 0;

//     // Insert each row into the Purchase table
//     const insertQuery = `
//       INSERT INTO Purchase 
//       (SupplierName, BillingAddress, ShippingAddress, PurchaseOrder, Reference, DeliveryDate, PurchaseOrderType, Location, ParentCode, ParentDescription, Quantity, UOM, Rate, Amount, GSTPercentage, ShipDate, DeliveryMessage, OtherCharges, IGSTPercentage, DiscountPercentage, SubTotal, GrandTotal, Note, FileName, FilePath) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const insertPromises = tableData.map((item) => {
//       // Calculate amount for each item and add to subTotal
//       const amount = item.quantity * item.rate;
//       subTotal += amount;

//       return connection.query(insertQuery, [
//         supplierName, billingAddress, shippingAddress, purchaseOrder, reference, deliveryDate, purchaseOrderType, location,
//         item.productCode, item.productDescription, item.quantity, item.uom, item.rate,
//         amount, item.gstPercentage, item.shipDate, item.deliveryMessage,
//         otherCharges, igstPercentage, discountPercentage, subTotal, grandTotal,
//         note,  // Pass the note field to the query
//         attachment ? attachment.originalname : null,
//         attachment ? attachment.path : null
//       ]);
//     });

//     // Execute all insertion queries
//     await Promise.all(insertPromises);

//     // Commit transaction
//     await connection.commit();
//     res.status(201).json({ success: true, message: "Purchase order submitted successfully" });
//   } catch (error) {
//     // Rollback transaction on error
//     if (connection) {
//       await connection.rollback();
//     }
//     console.error("Error submitting purchase order", error.message); // Log specific error message
//     res.status(500).json({ success: false, message: "Failed to submit purchase order" });
//   } finally {
//     // Release connection back to the pool
//     if (connection) {
//       connection.release();
//     }
//   }
// });

app.post("/api/purchase", upload.fields([
  { name: 'fileuplod', maxCount: 5 } // Allow up to 5 files for this field
]), async (req, res) => {
  const {
    supplierName,
    billingAddress,
    shippingAddress,
    purchaseOrder,
    reference,
    deliveryDate,
    purchaseOrderType,
    location,
    tableData: tableDataString,
    otherCharges,
    igstPercentage,
    discountPercentage,
    grandTotal,
    note,
  } = req.body;

  // Parse tableData from JSON string to an array
  const tableData = JSON.parse(tableDataString);

  // Get the array of uploaded files
  const files = req.files['fileuplod']; // This will be an array of files

  let connection;
  try {
    // Begin transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Initialize subTotal
    let subTotal = 0;

    // Insert each row into the Purchase table
    const insertQuery = `
      INSERT INTO Purchase 
      (SupplierName, BillingAddress, ShippingAddress, PurchaseOrder, Reference, DeliveryDate, PurchaseOrderType, Location, ParentCode, ParentDescription, Quantity, UOM, Rate, Amount, GSTPercentage, ShipDate, DeliveryMessage, OtherCharges, IGSTPercentage, DiscountPercentage, SubTotal, GrandTotal, Note, FileName, FilePath) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertPromises = tableData.map((item) => {
      // Calculate amount for each item and add to subTotal
      const amount = item.quantity * item.rate;
      subTotal += amount;

      return connection.query(insertQuery, [
        supplierName, billingAddress, shippingAddress, purchaseOrder, reference, deliveryDate, purchaseOrderType, location,
        item.productCode, item.productDescription, item.quantity, item.uom, item.rate,
        amount, item.gstPercentage, item.shipDate, item.deliveryMessage,
        otherCharges, igstPercentage, discountPercentage, subTotal, grandTotal,
        note,
        files.length > 0 ? files[0].originalname : null, // Example of handling the first file
        files.length > 0 ? files[0].path : null
      ]);
    });

    // Execute all insertion queries
    await Promise.all(insertPromises);

    // Commit transaction
    await connection.commit();
    res.status(201).json({ success: true, message: "Purchase order submitted successfully" });
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
    }
    console.error("Error submitting purchase order", error.message); // Log specific error message
    res.status(500).json({ success: false, message: "Failed to submit purchase order" });
  } finally {
    // Release connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



app.get('/api/purchases', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Purchase');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Purchase', error);
    res.status(500).json({ message: 'Failed to fetch Purchase' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});