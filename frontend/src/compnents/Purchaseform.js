import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

function PurchaseForm() {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputValue1, setInputValue1] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseOrderType, setPurchaseOrderType] = useState('');
  const [note, setNote] = useState('');
  const [tableData, setTableData] = useState([
    {
      productCode: '',
      productDescription: '',
      quantity: '',
      uom: '',
      rate: '',
      amount: '',
      gstPercentage: '',
      shipDate: '', // Changed to shipDate
      deliveryMessage: ''
    }
  ]);
  const [otherCharges, setOtherCharges] = useState(0);
  const [igstPercentage, setIgstPercentage] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [fileupload, setFileUpload] = useState(null); 
  const [productOptions, setProductOptions] = useState([]);




  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const response = await axios.get('http://localhost:3006/api/suppliers');
        setSupplierOptions(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    }
    fetchSuppliers();
  }, []);

  const handleSupplierChange = (e) => {
    const selectedSupplierName = e.target.value;
    setSelectedSupplier(selectedSupplierName);
  
    const selectedSupplierObj = supplierOptions.find(
      (supplier) => supplier.supplier_name === selectedSupplierName
    );
  
    if (selectedSupplierObj) {
      setBillingAddress(formatBillingAddress(selectedSupplierObj));
      setShippingAddress(formatShippingAddress(selectedSupplierObj));
    } else {
      setBillingAddress('');
      setShippingAddress('');
    }
  };

  const formatBillingAddress = (supplier) => {
    return `${supplier.billing_address || ''}, ${supplier.billing_street || ''}, ${supplier.billing_city || ''}, ${supplier.billing_state || ''}, ${supplier.billing_country || ''}, ${supplier.billing_zip || ''}`;
  };

  const formatShippingAddress = (supplier) => {
    return `${supplier.shipping_address || ''}, ${supplier.shipping_street || ''}, ${supplier.shipping_city || ''}, ${supplier.shipping_state || ''}, ${supplier.shipping_country || ''}, ${supplier.shipping_zip || ''}`;
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handlePurchaseOrderTypeChange = (e) => {
    setPurchaseOrderType(e.target.value);
  };

  const handleTableChange = (index, field, value) => {
    const updatedTableData = [...tableData];
    updatedTableData[index][field] = value;
    setTableData(updatedTableData);
    calculateAmounts(updatedTableData);
  };

  const addTableRow = () => {
    setTableData([
      ...tableData,
      {
        productCode: '',
        productDescription: '',
        quantity: '',
        uom: '',
        rate: '',
        amount: '',
        gstPercentage: '',
        shipDate: '', // Changed to shipDate
        deliveryMessage: ''
      }
    ]);
  };

  const removeTableRow = (index) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
    calculateAmounts(updatedTableData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('supplierName', selectedSupplier);
      formData.append('billingAddress', billingAddress);
      formData.append('shippingAddress', shippingAddress);
      formData.append('purchaseOrder', inputValue);
      formData.append('reference', inputValue1);
      formData.append('deliveryDate', date);
      formData.append('purchaseOrderType', purchaseOrderType);
      formData.append('location', location);
      formData.append('otherCharges', otherCharges);
      formData.append('igstPercentage', igstPercentage);
      formData.append('subTotal', subTotal);
      formData.append('discountPercentage', discountPercentage);
      formData.append('grandTotal', grandTotal);
      formData.append('note', note);
      formData.append('tableData', JSON.stringify(tableData));

      Array.from(selectedFiles).forEach((file) => {
        formData.append('fileuplod', file); // Use the same field name
      });
      

      await axios.post('http://localhost:3006/api/purchase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Purchase order submitted successfully!');
      resetForm();
    } catch (error) {
      console.error('Error submitting purchase order', error);
      alert('Failed to submit purchase order.');
    }
  };

  const resetForm = () => {
    setSelectedSupplier('');
    setInputValue('');
    setInputValue1('');
    setDate('');
    setLocation('');
    setPurchaseOrderType('');
    setTableData([
      {
        productCode: '',
        productDescription: '',
        quantity: '',
        uom: '',
        rate: '',
        amount: '',
        gstPercentage: '',
        shipDate: '',
        deliveryMessage: ''
      }
    ]);
    setOtherCharges(0);
    setIgstPercentage(0);
    setSubTotal(0);
    setDiscountPercentage(0);
    setGrandTotal(0);
    setNote('');
    setSelectedFiles([]);
  };

  const handleProductCodeChange = async (index, selectedProductCode) => {
    try {
      const response = await axios.get(`http://localhost:3006/api/product-details/${selectedProductCode}`);
      const { itemdescription, uom, price, tax } = response.data;

      const updatedTableData = [...tableData];
      updatedTableData[index] = {
        ...updatedTableData[index],
        productCode: selectedProductCode,
        productDescription: itemdescription,
        uom,
        rate: price,
        gstPercentage: tax
      };

      setTableData(updatedTableData);
      calculateAmounts(updatedTableData);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const calculateAmounts = (data) => {
    const updatedTableData = data.map(row => {
      const amount = row.quantity * row.rate;
      const gstAmount = (amount * row.gstPercentage) / 100;
      const totalAmount = amount + gstAmount;
      return { ...row, amount, gstAmount, totalAmount }; // Keep individual amounts
    });

    const subTotalWithoutTax = updatedTableData.reduce((acc, row) => acc + row.amount, 0);
    const totalTax = updatedTableData.reduce((acc, row) => acc + row.gstAmount, 0);
    const subTotalWithTax = subTotalWithoutTax + totalTax;
    const totalOtherCharges = otherCharges;

    const igstAmount = (subTotalWithTax * igstPercentage) / 100;
    const subTotalWithIgst = subTotalWithTax + igstAmount + totalOtherCharges;

    const discountAmount = (subTotalWithIgst * discountPercentage) / 100;
    const grandTotalAmount = subTotalWithIgst - discountAmount;

    setTableData(updatedTableData);
    setSubTotal(subTotalWithTax); // Set subtotal including tax and GST
    setGrandTotal(grandTotalAmount); // Set grand total without tax and other charges
  };

  useEffect(() => {
    calculateAmounts(tableData);
  }, [otherCharges, igstPercentage, discountPercentage]);

  useEffect(() => {
    async function fetchProductCodes() {
      try {
        const response = await axios.get('http://localhost:3006/api/productcode');
        setProductOptions(response.data);
      } catch (error) {
        console.error('Error fetching product codes:', error);
      }
    }
    fetchProductCodes();
  }, []);

  useEffect(() => {
    const fetchNextPurchaseOrderId = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/purchases');
        const lastPurchaseOrderId = response.data.length ? response.data[response.data.length - 1].PurchaseOrder : 'PO000';
        const lastIdNumber = parseInt(lastPurchaseOrderId.replace('PO', ''), 10);
        const nextIdNumber = lastIdNumber + 1;
        const formattedId = `PO${String(nextIdNumber).padStart(3, '0')}`; // Format purchase order ID
        setInputValue(formattedId); // Set initial purchase order ID
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };
    fetchNextPurchaseOrderId();
  }, []);

  const [selectedFiles, setSelectedFiles] = useState([]);

  // const handleFileChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   if (files.length + selectedFiles.length > 5) {
  //     alert('You can only upload a maximum of 5 files');
  //     return;
  //   }
  //   setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  // };

  // const handleUpload = () => {
   
  //   console.log(selectedFiles);
  // };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert('You can only upload a maximum of 5 files');
      return;
    }
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  return (
    <div className="form-control" style={{ fontSize: '12px', fontFamily: 'Arial' }}>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3" style={{ marginTop: '15px' }}>
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="location">Location:</label>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              id="purchaselocation"
              style={{ fontSize: '12px' }}
              value={location}
              onChange={handleLocationChange}
              required
            >
              <option value="">Select Location</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Australia">Australia</option>
              <option value="Paris">Paris</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
          <label htmlFor="supplierName">
            Supplier Name:<span style={{ color: 'red' }}>*</span>
          </label>
        </div>
        <div className="col-md-3" style={{ position: 'relative' }}>
          <select
            id="supplierName"
            className="form-control"
            value={selectedSupplier}
            onChange={handleSupplierChange}
            style={{ fontSize: '12px' }}
            required
          >
            <option value="">Select Supplier</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.supplier_name}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSupplier && (
        <div className="row mb-3">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="billingAddress">
              Billing Address:<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3" style={{ position: 'relative' }}>
          <textarea
              className="form-control"
              value={billingAddress}
              readOnly
              style={{ fontSize: '12px' }}
            />
          </div>

          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="shippingAddress">
              Shipping Address:<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3" style={{ position: 'relative' }}>
          <textarea
              className="form-control"
              value={shippingAddress}
              readOnly
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>
      )}
        <div className="row mb-3">
        <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
    <label htmlFor="purchaseOrder">Purchase Order:</label>
  </div>
  <div className="col-md-3" style={{ position: 'relative' }}>
    <input
      type="text"
      id="purchaseOrder"
      className="form-control"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      required
      placeholder='Add Purchase Order'
      style={{ fontSize: '12px' }}
    />
  </div>


          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="date">Delivery Date:</label>
          </div>
          <div className="col-md-3" style={{ position: 'relative' }}>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="purchaseOrderType">Purchase Order Type:</label>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              id="purchaseOrderType"
              style={{ fontSize: '12px' }}
              value={purchaseOrderType}
              onChange={handlePurchaseOrderTypeChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Direct">Direct</option>
              <option value="Indirect">Indirect</option>
            </select>
          </div>

          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="reference">Reference:</label>
          </div>
          <div className="col-md-3" style={{ position: 'relative' }}>
            <input
              type="text"
              id="reference"
              className="form-control"
              value={inputValue1}
              onChange={(e) => setInputValue1(e.target.value)}
              required
              placeholder='Add Reference'
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
        <table className="table table-bordered">
        <thead>
  <tr style={{ backgroundColor: '#BFBFBF', fontSize: '12px', fontWeight: 'bold' }}>
    <th scope="col" className="col-md-3">Product Code & Description</th>
    <th scope="col" className="col-md-1">Quantity</th>
    <th scope="col" className="col-md-1">UOM</th>
    <th scope="col" className="col-md-1">Rate</th>
    <th scope="col" className="col-md-1">Amount</th>
    <th scope="col" className="col-md-1">GST (%)</th>
    <th scope="col" className="col-md-2">Ship Date</th>
    <th scope="col" className="col-md-1">Actions</th>
  </tr>
</thead>

            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>
                  <select
                     className="form-select"
                     value={row.productCode}
                     onChange={(e) => handleProductCodeChange(index, e.target.value)}
                  >
                     <option value="">Select Product Code</option>
                     {productOptions.map((product) => (
                       <option key={product.itemcode} value={product.itemcode}>
                         {product.itemcode}
                       </option>
                     ))}
                  </select>
                  <br></br>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Product Description"
                      value={row.productDescription}
                      onChange={(e) => handleTableChange(index, 'productDescription', e.target.value)}
setFileUpload                      required
                      style={{ fontSize: '12px' }}
                    />
                  </td>
                  
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.quantity}
                      onChange={(e) => handleTableChange(index, 'quantity', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={row.uom}
                      onChange={(e) => handleTableChange(index, 'uom', e.target.value)}
                      readOnly
                      required
                      style={{ fontSize: '12px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.rate}
                      onChange={(e) => handleTableChange(index, 'rate', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.amount}
                      readOnly
                      style={{ fontSize: '12px' }}
                    />
                  </td>
                
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.gstPercentage}
                      onChange={(e) => handleTableChange(index, 'gstPercentage', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                  </td>


                  <td>
                    <input
                      type="date"
                      className="form-control"
                      value={row.shipDate}
                      onChange={(e) => handleTableChange(index, 'shipDate', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                 <br></br>
                    <input
                      type="text"
                      className="form-control"
                      value={row.deliveryMessage}
                      onChange={(e) => handleTableChange(index, 'deliveryMessage', e.target.value)}
                      placeholder='Message'
                      style={{ fontSize: '12px' }}
                    />
                  </td>

                  
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeTableRow(index)}
                      style={{ fontSize: '12px', marginRight: '10px' }} // Adjust margin as needed
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={addTableRow}
                      style={{ fontSize: '12px' }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </td>
                </tr>
              ))}
            
            </tbody>
          </table>

          </div>

          <div className="row mb-3 d-flex justify-content-end ">
          <div className="col-md-2"  style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="otherCharges">
              Other Charges:<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              id="otherCharges"
              className="form-control"
              value={otherCharges}
              onChange={(e) => setOtherCharges(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="row mb-3 d-flex justify-content-end ">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="igstPercentage">
              IGST (%):<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              id="igstPercentage"
              className="form-control"
              value={igstPercentage}
              onChange={(e) => setIgstPercentage(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="row mb-3 d-flex justify-content-end ">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="subTotal">
              Subtotal:<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              id="subTotal"
              className="form-control"
              value={subTotal}
              readOnly
            />
          </div>
        </div>

        <div className="row mb-3 d-flex justify-content-end ">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="discountPercentage">
              Discount (%):<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              id="discountPercentage"
              className="form-control"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="row mb-3 d-flex justify-content-end ">
          <div className="col-md-2" style={{ textAlign: 'start', fontWeight: 'bold' }}>
            <label htmlFor="grandTotal">
              Grand Total:<span style={{ color: 'red' }}>*</span>
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              id="grandTotal"
              className="form-control"
              value={grandTotal}
              readOnly
            />
          </div>
        </div>

        <div className='row mb-3'>
     <div className="col-md-4">
      <label className="form-label" htmlFor="fileupload" style={{ textAlign: 'start', fontWeight: 'bold' }}>
        File upload:
      </label>
      <div className="input-group">
        <input
          type="file"
          className="form-control"
          id="fileupload"
          onChange={handleFileChange}
          style={{ fontSize: '12px' }}
          multiple
        />
        {/* <button className="btn btn-outline-secondary" type="button" id="uploadButton" onClick={handleUpload}>
          Upload
        </button> */}
      </div>
      {/* {selectedFiles.length > 0 && (
        <div className="mt-2">
          <h6>Selected Files:</h6>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  

  <div className="col-md-8">
    <label className="form-label" htmlFor="note" style={{ fontWeight: 'bold' }}>Note:</label>
    <textarea
              type="text"
              id="note"
              className="form-control"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              placeholder='Add Note'
              style={{ fontSize: '12px', width: '100%', height: '30px' }}
            />
  </div>
</div>




        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default PurchaseForm;