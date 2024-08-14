import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Modal, Button } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from 'html2canvas';

const PurchaseOrder = () => {
  const [purchases, setPurchases] = useState([]);
  const [checkedPurchase, setCheckedPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null); // State for selected purchase
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:3006/api/purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleCheckboxChange = (id) => {
    setCheckedPurchase((prevChecked) => (prevChecked === id ? null : id));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3006/api/purchases/${id}`);
      fetchPurchases();
      console.log(`Deleted purchase with id ${id}`);
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format to display only the date portion
  };


  

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase); 
  };

  const handleClose = () => {
    setSelectedPurchase(null);
  };


const generatePDF = async (purchase) => {
  const doc = new jsPDF();

  // Group purchases by PurchaseOrder
  const groupedPurchases = purchases.reduce((acc, curr) => {
    if (acc[curr.PurchaseOrder]) {
      acc[curr.PurchaseOrder].push(curr);
    } else {
      acc[curr.PurchaseOrder] = [curr];
    }
    return acc;
  }, {});

  // Find purchases for the selected PurchaseOrder
  const selectedPurchases = groupedPurchases[purchase.PurchaseOrder];

  // Calculate totals
  let totalAmount = 0;
  selectedPurchases.forEach(item => {
    totalAmount += item.Quantity * item.Rate;
  });

  // Calculate SGST and CGST (for example, 5% each)
  const sgst = (totalAmount * 0.05).toFixed(2);
  const cgst = (totalAmount * 0.05).toFixed(2);

  // Calculate Grand Total
  const grandTotal = parseFloat(totalAmount) + parseFloat(sgst) + parseFloat(cgst);

  // Format dates
  const formattedDeliveryDate = new Date(purchase.DeliveryDate).toLocaleDateString('en-IN'); // Adjust 'en-IN' based on desired locale
  const formattedShipDate = new Date(purchase.shipDate).toLocaleDateString('en-IN'); // Adjust 'en-IN' based on desired locale

  // Content for the PDF
  const content = `
    Voucher No: ${purchase.PurchaseOrder}
    Delivery Date: ${formattedDeliveryDate}
    Reference No: ${purchase.Reference}
    Ship Date: ${formattedShipDate}

    Invoice To:
    Company Name: AGRWAL INDUSTRIES
    Address: ABC
    GST No: 12JHFIH444
    State Name: MAHARASHTRA
    Email: AGRWAL@GMAIL.COM

    Billing Address:
    ${purchase.BillingAddress}
    
    Shipping Address:
    ${purchase.ShippingAddress}
   
  `;

  doc.text(content, 10, 10);

  const columns = [
    { header: 'SR NO', dataKey: 'srNo' },
    { header: 'DESCRIPTION OF GOODS', dataKey: 'description' },
    { header: 'DELIVERY DATE', dataKey: 'deliveryDate' },
    { header: 'QUANTITY', dataKey: 'quantity' },
    { header: 'RATE', dataKey: 'rate' },
    { header: 'PER', dataKey: 'uom' },
    { header: 'DISCOUNT', dataKey: 'discount' },
    { header: 'AMOUNT', dataKey: 'amount' }
  ];

  // Define table rows
  const rows = selectedPurchases.map((item, index) => ({
    srNo: index + 1,
    description: item.ParentDescription,
    deliveryDate: new Date(item.DeliveryDate).toLocaleDateString('en-IN'), // Adjust 'en-IN' based on desired locale
    quantity: item.Quantity,
    rate: item.Rate,
    uom: item.UOM,
    discount: item.DiscountPercentage,
    amount: (item.Quantity * item.Rate).toFixed(2)
  }));

  // Add totals row
  rows.push({
    srNo: '',
    description: '',
    deliveryDate: '',
    quantity: '',
    rate: '',
    uom: '',
    discount: 'Total Amount',
    amount: totalAmount.toFixed(2)
  }, {
    srNo: '',
    description: '',
    deliveryDate: '',
    quantity: '',
    rate: '',
    uom: '',
    discount: 'SGST',
    amount: sgst
  }, {
    srNo: '',
    description: '',
    deliveryDate: '',
    quantity: '',
    rate: '',
    uom: '',
    discount: 'CGST',
    amount: cgst
  }, {
    srNo: '',
    description: '',
    deliveryDate: '',
    quantity: '',
    rate: '',
    uom: '',
    discount: 'Grand Total',
    amount: grandTotal.toFixed(2)
  });

  // Add table to the PDF with styles
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: rows.map(row => columns.map(col => row[col.dataKey])),
    startY: 150, 
    styles: { lineColor: [0, 0, 0], lineWidth: 0.5 }, 
    headStyles: {
      fillColor: [242, 242, 242], 
      textColor: [0, 0, 0], 
      lineColor: [0, 0, 0], 
      lineWidth: 0.5 
    }
  });

  doc.save(`purchase_order_${purchase.PurchaseOrder}`.pdf);
};

  return (
    <div className='content'>
      <div className='row mb-3'>
        <div className='col-md-10'>
          <h3 id='headingstockD' style={{ fontFamily: 'Arial, sans-serif' }}>Purchase Order</h3>
        </div>

        <div className='col-md-1'>
          {checkedPurchase && (
            <div className='mb-3'>
              <button className='btn btn-success' onClick={() => console.log('Add GRN clicked')}>
                Add GRN
              </button>
            </div>
          )}
        </div>

        <div className='col-md-1'>
          <button
            className='btn btn-dark'
            id='ADD PO'
            style={{ backgroundColor: '#19395d', fontSize: '14px', border: 'none', color: 'white', borderRadius: '0' }}
            onClick={() => navigate('/purchase/AddPOform')}
          >
            Add PO
          </button>
        </div>
      </div>

      <div className='form-control'>
        <div className='row mb-3'>
          <div className='col-md-12'>
            <div className='table-responsive'>
              <table className='table table-bordered'>
                <thead
                  style={{ fontSize: '12px', backgroundColor: '#f2f2f2', verticalAlign: 'top', fontFamily: 'Arial' }}
                >
                  <tr>
                    <th>Supplier Name</th>
                    <th>Po DeliveryDate</th>
                    <th>PurchaseOrder</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Approved By</th>
                    <th>GRN History</th>
                    <th>Checkbox</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.SupplierName}</td>
                      <td>{formatDate(purchase.DeliveryDate)}</td>
                      <td onClick={() => generatePDF(purchase)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {purchase.PurchaseOrder}
                      </td>
                      <td>{purchase.GrandTotal}</td>
                      <td>{purchase.Status}</td>
                      <td>{purchase.CreatedBy}</td>
                      <td>{purchase.ApprovedBy}</td>
                      <td>{/* Implement GRN History display */}</td>
                      <td>
                        <input
                          type='checkbox'
                          checked={checkedPurchase === purchase.id}
                          onChange={() => handleCheckboxChange(purchase.id)}
                        />
                      </td>
                      <td>
                        <button className='btn btn-info btn-sm' onClick={() => console.log(`Editing purchase with id ${purchase.id}`)}>Edit</button>
                        <button className='btn btn-danger btn-sm' onClick={() => handleDelete(purchase.id)}>Delete</button>
                        <button onClick={() => handleViewDetails(purchase)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

     <Modal show={selectedPurchase !== null} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>View Purchase Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase && (
            <>
              <p><strong>Supplier Name:</strong> {selectedPurchase.SupplierName}</p>
              <p><strong>Delivery Date:</strong> {formatDate(selectedPurchase.DeliveryDate)}</p>
              <p><strong>Purchase Order:</strong> {selectedPurchase.PurchaseOrder}</p>
              <p><strong>Amount:</strong> {selectedPurchase.GrandTotal}</p>
              <p><strong>Status:</strong> {selectedPurchase.Status}</p>
              <p><strong>Created By:</strong> {selectedPurchase.CreatedBy}</p>
              <p><strong>Approved By:</strong> {selectedPurchase.ApprovedBy}</p>

              <p><strong> BillingAddress:</strong> {selectedPurchase.BillingAddress}</p>
              <p><strong> ShippingAddress:</strong> {selectedPurchase.ShippingAddress}</p>
              <p><strong> Reference:</strong> {selectedPurchase.Reference}</p>
              <p><strong>PurchaseOrderType :</strong> {selectedPurchase.PurchaseOrderType}</p>
              <p><strong> Location :</strong> {selectedPurchase.Location}</p>
              <p><strong> ParentCode:</strong> {selectedPurchase.ParentCode}</p>
              <p><strong>  ParentDescription:</strong> {selectedPurchase.ParentDescription}</p>
              <p><strong> Quantity:</strong> {selectedPurchase.Quantity}</p>
              <p><strong>UOM:</strong> {selectedPurchase.UOM}</p>

              <p><strong>Rate:</strong> {selectedPurchase.Rate}</p>
              <p><strong>GSTPercentage:</strong> {selectedPurchase.GSTPercentage}</p>
              <p><strong>shipDate :</strong> {formatDate(selectedPurchase.shipDate)}</p>
              <p><strong>DeliveryMessage :</strong> {selectedPurchase.DeliveryMessage}</p>
              <p><strong>OtherCharges:</strong> {selectedPurchase.OtherCharges}</p>
              <p><strong>IGSTPercentage:</strong> {selectedPurchase.IGSTPercentage}</p>
              <p><strong>DiscountPercentage:</strong> {selectedPurchase.DiscountPercentage}</p>

              <p><strong>SubTotal:</strong> {selectedPurchase.SubTotal}</p>
              <p><strong>GrandTotal:</strong> {selectedPurchase.GrandTotal}</p>
              <p><strong>Note:</strong> {selectedPurchase.Note}</p>

              <p><strong>fileName:</strong> {selectedPurchase.fileName}</p>

              {/* Add more fields as needed */}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    

    </div>

  );
};

export default PurchaseOrder;
