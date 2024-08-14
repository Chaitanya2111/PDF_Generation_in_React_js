const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs= require("fs");
const path =require("path");
const multer = require("multer");
const app = express();
const port = 5005;

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

// Route to fetch item names from rawmaterials
app.get('/api/item-names', async (req, res) => {
  try {
    const sql = `
      SELECT itemname FROM rawmaterials
      UNION
      SELECT itemname FROM finishgoods
      UNION
      SELECT itemname FROM semifinish
    `;
    const [rows] = await pool.query(sql);
    const itemNames = rows.map(row => row.itemname);
    res.json(itemNames);
  } catch (error) {
    console.error('Error fetching item names:', error);
    res.status(500).json({ error: 'Failed to fetch item names' });
  }
});
// Route to fetch item details based on item name from rawmaterials
app.get('/api/item-details/:itemName', async (req, res) => {
  try {
    const itemName = req.params.itemName;
    const sql = `
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'rawmaterials' AS source 
      FROM rawmaterials 
      WHERE itemname = ?
      UNION
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'finishgoods' AS source 
      FROM finishgoods 
      WHERE itemname = ?
      UNION
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'semifinish' AS source 
      FROM semifinish 
      WHERE itemname = ?
    `;
    const [rows] = await pool.query(sql, [itemName, itemName, itemName]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemDetails = rows[0];
    res.json(itemDetails);
  } catch (error) {
    console.error('Error fetching item details:', error);
    res.status(500).json({ error: 'Failed to fetch item details' });
  }
});

// Route to insert issue data into the database
app.post('/api/issue', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      Date,
      Job,
      Department,
      IssuedBy,
      TransportMode,
      Remark,
      tableData // Table data array
    } = req.body;

    await connection.beginTransaction();

    const sql = `
      INSERT INTO issue (date, job, issueddep, issuedby, transportmode, remark, itemcode, itemname, itemdescription, itemcategory, itemsubcategory, unit, qtyissued) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const row of tableData) {
      const {
        itemCode,
        itemName,
        description,
        category,
        subCategory,
        unit,
        qtyIssued
      } = row;

      await connection.query(sql, [Date, Job, Department, IssuedBy, TransportMode, Remark, itemCode, itemName, description, category, subCategory, unit, qtyIssued]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Issue data inserted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error inserting issue data:', error);
    res.status(500).json({ error: 'Failed to insert issue data' });
  } finally {
    connection.release();
  }
});

// Route to fetch all issue data
app.get('/api/issue', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM issue');
    res.json(results);
  } catch (error) {
    console.error('Error fetching issue data from MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch item names from finishgoods for receive
app.get('/api/receive-item-names', async (req, res) => {
  try {
    const sql = `
      SELECT itemname FROM rawmaterials
      UNION
      SELECT itemname FROM finishgoods
      UNION
      SELECT itemname FROM semifinish
    `;
    const [rows] = await pool.query(sql);
    const itemNames = rows.map(row => row.itemname);
    res.json(itemNames);
  } catch (error) {
    console.error('Error fetching item names:', error);
    res.status(500).json({ error: 'Failed to fetch item names' });
  }
});


// Route to fetch item details based on item name from finishgoods for receive
app.get('/api/receive-item-details/:itemName', async (req, res) => {
  try {
    const itemName = req.params.itemName;
    const sql = `
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'rawmaterials' AS source 
      FROM rawmaterials 
      WHERE itemname = ?
      UNION
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'finishgoods' AS source 
      FROM finishgoods 
      WHERE itemname = ?
      UNION
      SELECT itemcode, itemname, itemdescription, category, subcategory, uom, 'semifinish' AS source 
      FROM semifinish 
      WHERE itemname = ?
    `;
    const [rows] = await pool.query(sql, [itemName, itemName, itemName]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemDetails = rows[0];
    res.json(itemDetails);
  } catch (error) {
    console.error('Error fetching item details:', error);
    res.status(500).json({ error: 'Failed to fetch item details' });
  }
});


// Route to insert receive data into the database
app.post('/api/receive', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      Date,
      Job,
      Department,
      ReceivedBy,
      TransportMode,
      Remark,
      Suppliername,
      DcNo,
      Pono,
      InvoiceNumber,
      tableData // Table data array
    } = req.body;

    await connection.beginTransaction();

    const sql = `
      INSERT INTO receive (date, job, receiveddep, receivedby, transportmode, remark, suppliername, dcno, pono, invoiceno, itemcode, itemname, itemdescription, itemcategory, itemsubcategory, unit, qtyreceived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const row of tableData) {
      const {
        itemCode,
        itemName,
        description,
        category,
        subCategory,
        unit,
        qtyReceived
      } = row;

      await connection.query(sql, [Date, Job, Department, ReceivedBy, TransportMode, Remark, Suppliername, DcNo, Pono, InvoiceNumber, itemCode, itemName, description, category, subCategory, unit, qtyReceived]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Receive data inserted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error inserting receive data:', error);
    res.status(500).json({ error: 'Failed to insert receive data' });
  } finally {
    connection.release();
  }
});

// Route to update receive data
app.put("/api/receive/:id", async (req, res) => {
  const { id } = req.params;
  const updatedReceiveTableData = req.body;

  try {
    const query = `
      UPDATE receive SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedReceiveTableData, id]);
    res.status(200).json({ message: "Receive data updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating data", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// Route to delete receive data
app.delete("/api/receive/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM receive WHERE id = ?", [id]);
    res.status(200).json({ message: "Receive data deleted successfully", deletedItemId: id });
  } catch (error) {
    console.error("Error deleting data", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// Route to fetch all receive data
app.get('/api/receive', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM receive');
    res.json(results);
  } catch (error) {
    console.error('Error fetching receive data from MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all stockledger data
app.get('/api/stockledger', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM stockledger');
    res.json(results);
  } catch (error) {
    console.error('Error fetching stockledger data from MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Update stock ledger entry
app.put("/api/stockledger/:id", async (req, res) => {
  const { id } = req.params;
  const updatedStockLedgerData = req.body;

  try {
    const query = `
      UPDATE stockledger SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedStockLedgerData, id]);
    res.status(200).json({ message: "Stock ledger entry updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating stock ledger entry", error);
    res.status(500).json({ error: "Error updating stock ledger entry" });
  }
});

// Delete stock ledger entry
app.delete("/api/stockledger/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM stockledger WHERE id = ?", [id]);
    res.status(200).json({ message: "Stock ledger entry deleted successfully", deletedItemId: id });
  } catch (error) {
    console.error("Error deleting stock ledger entry", error);
    res.status(500).json({ error: "Error deleting stock ledger entry" });
  }
});



// Route to update issue data
app.put("/api/issue/:id", async (req, res) => {
  const { id } = req.params;
  const updatedIssueTableData = req.body;

  try {
    // Extract and convert the date to MySQL compatible format
    const { date, ...otherData } = updatedIssueTableData;
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      UPDATE issue SET ? WHERE id = ?
    `;

    await pool.query(query, [{ ...otherData, date: formattedDate }, id]);
    res.status(200).json({ message: "Issue data updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating data", error);
    res.status(500).json({ error: "Error updating data" });
  }
});


// Route to update issue data
app.put("/api/issue/:id", async (req, res) => {
  const { id } = req.params;
  const updatedIssueTableData = req.body;

  try {
    const query = `
      UPDATE issue SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedIssueTableData, id]);
    res.status(200).json({ message: "Issue data updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating data", error);
    res.status(500).json({ error: "Error updating data" });
  }
});


// Route to delete issue data
app.delete("/api/issue/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM issue WHERE id = ?", [id]);
    res.status(200).json({ message: "Issue data deleted successfully", deletedItemId: id });
  } catch (error) {
    console.error("Error deleting data", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// Route to fetch all issue data
app.get('/api/issue', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM issue');
    res.json(results);
  } catch (error) {
    console.error('Error fetching issue data from MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to insert raw material data into the database
app.post('/api/rawmaterial', async (req, res) => {
  try {
    const {
      itemcode,
      itemname,
      description,
      category,
      subcategory,
      unit
    } = req.body;

    const sql = `
      INSERT INTO rawmaterials (itemcode, itemname, itemdescription, category, subcategory, uom) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [itemcode, itemname, description, category, subcategory, unit]);
    res.status(201).json({ message: 'Raw material data inserted successfully' });
  } catch (error) {
    console.error('Error inserting raw material data:', error);
    res.status(500).json({ error: 'Failed to insert raw material data' });
  }
});

// Route to update raw material data
app.put("/api/rawmaterial/:id", async (req, res) => {
  const { id } = req.params;
  const updatedRawMaterialData = req.body;

  try {
    const query = `
      UPDATE rawmaterials SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedRawMaterialData, id]);
    res.status(200).json({ message: "Raw material data updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating data", error);
    res.status(500).json({ error: "Error updating data" });
  }
});

// Route to delete raw material data
app.delete("/api/rawmaterial/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM rawmaterials WHERE id = ?", [id]);
    res.status(200).json({ message: "Raw material data deleted successfully", deletedItemId: id });
  } catch (error) {
    console.error("Error deleting data", error);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// Route to fetch all raw material data
app.get('/api/rawmaterial', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM rawmaterials');
    res.json(results);
  } catch (error) {
    console.error('Error fetching raw material data from MySQL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Login API endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM login WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  });
});


//finishgood
app.post("/api/finishgoods", async (req, res) => {
  const {
    itemType,
    source,
    ownership,
    category,
    subcategory,
    productCommodity,
    productCategory,
    productName,
    productType,
    itemcode,
    itemName,
    itemdescription,
    revisionNo,
    uom,
    price,
    tax,
    hsncode,
    moq,
    reorderlevel,
    class: itemClass, 
    qcRequired,
    shelfLife
  } = req.body;

  try {
    const query = `
      INSERT INTO finishgoods (
        itemType,
        source,
        ownership,
        category,
        subcategory,
        productCommodity,
        productCategory,
        productName,
        productType,
        itemcode,
        itemName,
        itemdescription,
        revisionNo,
        uom,
        price,
        tax,
        hsncode,
        moq,
        reorderlevel,
        class,
        qcRequired,
        shelfLife
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      itemType,
      source,
      ownership,
      category,
      subcategory,
      productCommodity,
      productCategory,
      productName,
      productType,
      itemcode,
      itemName,
      itemdescription,
      revisionNo,
      uom,
      price,
      tax,
      hsncode,
      moq,
      reorderlevel,
      itemClass,
      qcRequired,
      shelfLife
    ];

    await pool.query(query, values);
    res.status(201).send("Finish goods inserted successfully");
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).send("Error inserting data");
  }
});


app.get("/api/finishgoods", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM finishgoods");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).send("Error fetching data");
  }
});

app.put("/api/finishgoods/:id", async (req, res) => {
  const { id } = req.params;
  const { ...updatedFinishGoodData } = req.body;

  try {
    const query = `
      UPDATE finishgoods SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedFinishGoodData, id]);
    res.status(200).send("Finish goods updated successfully");
  } catch (error) {
    console.error("Error updating data", error);
    res.status(500).send("Error updating data");
  }
});

app.delete("/api/finishgoods/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM finishgoods WHERE id = ?", [id]);
    res.status(200).send("Finish goods deleted successfully");
  } catch (error) {
    console.error("Error deleting data", error);
    res.status(500).send("Error deleting data");
  }
});





// Create 'uploads' directory if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


// app.post('/api/supplier', async (req, res) => {
  // const {
  //   supplierId,
  //   supplierName,
  //   supplierType,
  //   mobileNo,
  //   phoneNo,
  //   emailId,
  //   companyWebsite,
  //   gstNo,
  //   deliveryMethod,
  //   shippingCategory,
  //   shippingAddress,
  //   shippingStreet,
  //   shippingCity,
  //   shippingState,
  //   shippingCountry,
  //   shippingZip,
  //   billingCategory,
  //   billingAddress,
  //   billingStreet,
  //   billingCity,
  //   billingState,
  //   billingCountry,
  //   billingZip,
  //   paymentType,
  //   paymentMethod,
  //   bankName,
  //   accountNumber,
  //   ifscCode,
  //   creditLimit,
  //   creditPeriod,
  //   panNumber,
  //   contacts // Array of contact details
  // } = req.body;

//   try {
//     const connection = await pool.getConnection();
//     await connection.query('START TRANSACTION');

//     // Prepare insert query for supplier with contacts
//     const insertSupplierSql = `
  //   INSERT INTO suppliertable
  //   ( supplier_id, supplier_name, supplier_type, mobile_no, phone_no, email_id, company_website, gst_no, delivery_method, 
  //       shipping_category, shipping_address, shipping_street, shipping_city, shipping_state, shipping_country, shipping_zip,
  //       billing_category, billing_address, billing_street, billing_city, billing_state, billing_country, billing_zip, paymentType, paymentMethod, bankName, accountNumber, ifscCode, creditLimit, creditPeriod, panNumber, contactName, contactDesignation, contactPhone, contactMobile, contactEmail) 
  //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  // `;


//     // Flatten contacts array into an array of values
//     const contactValues = contacts.map(contact => [
//       supplierId,
//       supplierName,
//       supplierType,
//       mobileNo,
//       phoneNo,
//       emailId,
//       companyWebsite,
//       gstNo,
//       deliveryMethod,
//       shippingCategory,
//       shippingAddress,
//       shippingStreet,
//       shippingCity,
//       shippingState,
//       shippingCountry,
//       shippingZip,
//       billingCategory,
//       billingAddress,
//       billingStreet,
//       billingCity,
//       billingState,
//       billingCountry,
//       billingZip,
//       paymentType,
//       paymentMethod,
//       bankName,
//       accountNumber,
//       ifscCode,
//       creditLimit,
//       creditPeriod,
//       panNumber,
//       contact.name,
//       contact.designation,
//       contact.phone,
//       contact.mobile,
//       contact.email
//     ]);
    

//     // Execute the insert queries for each contact
//     const insertPromises = contactValues.map(contactValue =>
//       connection.query(insertSupplierSql, contactValue)
//     );

//     // Await all insert queries
//     await Promise.all(insertPromises);

//     // Commit the transaction
//     await connection.query('COMMIT');
//     connection.release();

//     res.status(201).json({ message: 'Supplier created successfully' });
//   } catch (error) {
//     console.error('Error creating supplier:', error);
//     res.status(500).json({ error: 'Failed to create supplier' });
//   }
// });



 app.post("/api/supplier", upload.fields([
  { name: 'gstAttachment', maxCount: 1 },
  { name: 'panAttachment', maxCount: 1 }
]), async (req, res) => {
  const {
    supplierId, supplierName, supplierType, mobileNo, phoneNo, emailId, companyWebsite,
    gstNo, deliveryMethod, shippingCategory, shippingAddress, shippingStreet, shippingCity,
    shippingState, shippingCountry, shippingZip, billingCategory, billingAddress, billingStreet,
    billingCity, billingState, billingCountry, billingZip, paymentType, paymentMethod, bankName,
    accountNumber, ifscCode, creditLimit, creditPeriod, panNumber
  } = req.body;
  
  const {
    contactName, contactDesignation, contactPhone, contactMobile, contactEmail
  } = req.body; // Ensure these are correctly extracted
  
const gstAttachment = req.files && req.files['gstAttachment'] ? req.files['gstAttachment'][0] : null;
const panAttachment = req.files && req.files['panAttachment'] ? req.files['panAttachment'][0] : null;


  try {
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO suppliertable (
        supplier_id, supplier_name, supplier_type, mobile_no, phone_no, email_id, company_website, gst_no, delivery_method,
        shipping_category, shipping_address, shipping_street, shipping_city, shipping_state, shipping_country, shipping_zip,
        billing_category, billing_address, billing_street, billing_city, billing_state, billing_country, billing_zip, paymentType, paymentMethod, bankName, accountNumber, ifscCode, creditLimit, creditPeriod, panNumber,
        contactName, contactDesignation, contactPhone, contactMobile, contactEmail,
        gst_attachment_name, gst_attachment_path, pan_attachment_name, pan_attachment_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierId, supplierName, supplierType, mobileNo, phoneNo, emailId, companyWebsite, gstNo, deliveryMethod,
        shippingCategory, shippingAddress, shippingStreet, shippingCity, shippingState, shippingCountry, shippingZip,
        billingCategory, billingAddress, billingStreet, billingCity, billingState, billingCountry, billingZip,
        paymentType, paymentMethod, bankName, accountNumber, ifscCode, creditLimit, creditPeriod, panNumber,
        contactName, contactDesignation, contactPhone, contactMobile, contactEmail,
        gstAttachment ? gstAttachment.originalname : null, gstAttachment ? gstAttachment.path : null,
        panAttachment ? panAttachment.originalname : null, panAttachment ? panAttachment.path : null
      ]
    );
    connection.release();
    res.status(200).send("Supplier inserted successfully");
  } catch (error) {
    console.error("Error inserting supplier:", error);
    res.status(500).send("Error inserting supplier");
  }
  
});



app.get('/api/suppliers', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.query('SELECT * FROM suppliertable');
    connection.release(); // Release the connection back to the pool

    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliertable form data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put("/api/suppliers/:id", async (req, res) => {
  const { id } = req.params;
  const updatedSupplierData = req.body;

  try {
    const query = `
      UPDATE suppliertable SET ? WHERE id = ?
    `;

    await pool.query(query, [updatedSupplierData, id]);
    res.status(200).json({ message: "Supplier entry updated successfully", updatedItemId: id });
  } catch (error) {
    console.error("Error updating supplier entry", error);
    res.status(500).json({ error: "Error updating supplier entry" });
  }
});

// Delete supplier entry
app.delete("/api/suppliers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM suppliertable WHERE id = ?", [id]);
    res.status(200).json({ message: "Supplier entry deleted successfully", deletedItemId: id });
  } catch (error) {
    console.error("Error deleting supplier entry", error);
    res.status(500).json({ error: "Error deleting supplier entry" });
  }
});





















app.post('/api/subcategory', async (req, res) => {
  const { product, rate, leadTime, moq, category, subcategory } = req.body;

  // Validate the request body
  if (!product || !rate || !leadTime || !moq || !category || !subcategory) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = 'INSERT INTO Product (Product, Rate, LeadTime, MOQ, Category, Subcategory) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [product, rate, leadTime, moq, category, subcategory];
    
    const [result] = await pool.execute(query, values);
    
    res.status(201).json({ message: 'Product added successfully', result });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product');
    res.status(200).json(rows); // Send the fetched rows as JSON response
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get subcategories by category
app.get("/api/subcategory/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const [rows] = await pool.query("SELECT DISTINCT subcategory FROM category WHERE category = ?", [category]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching subcategory data", error);
    res.status(500).send("Error fetching subcategory data");
  }
});

// Get all categories
app.get("/api/category", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DISTINCT category FROM category");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching category data", error);
    res.status(500).send("Error fetching category data");
  }
});

// Update a product
app.put("/api/subcategory/:id", async (req, res) => {
  const productId = req.params.id;
  const { product, rate, leadTime, moq } = req.body;
  try {
    const query = "UPDATE Product SET Product = ?, Rate = ?, LeadTime = ?, MOQ = ? WHERE id = ?";
    const values = [product, rate, leadTime, moq, productId];
    await pool.query(query, values);
    res.status(200).send("Product updated successfully");
  } catch (error) {
    console.error("Error updating product", error);
    res.status(500).send("Error updating product");
  }
});

// Delete a product
app.delete("/api/subcategory/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM Product WHERE id = ?", [id]);
    res.status(200).send("Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product", error);
    res.status(500).send("Error deleting product");
  }
});

















app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});