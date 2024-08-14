import React from 'react';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './Pdf.css'; // You can define additional custom styles in Pdf.css if needed
import html2canvas from "html2canvas";

const Pdfformate = () => {
  const generatePDF = () => {
    const input = document.getElementById('pdfContent');
    
    // Set the value of input fields and textareas before capturing
    const setInputValues = () => {
      const inputs = input.querySelectorAll('input');
      inputs.forEach((input) => {
        input.setAttribute('value', input.value);
      });
  
      const textareas = input.querySelectorAll('textarea');
      textareas.forEach((textarea) => {
        textarea.innerHTML = textarea.value;
      });
    };
  
    setInputValues();
  
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('PurchaseOrder.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF ', error);
      });
  };

  return (
    <div className="container">
      <div className="text-center">
        <button type="button" className="btn btn-primary my-4" onClick={generatePDF}>Generate PDF</button>
      </div>
      <div id="pdfContent">
        <h4 className="text-center fw-bold">PURCHASE ORDER</h4>
        <div className="border border-dark p-4">
          <div className="row justify-content-start">
            <div className="col-md-6 border-end border-dark">
              <h5 className="fw-bold"style={{ textAlign: "start" }}>Invoice To:</h5>


              <div className="row ">
                <label htmlFor="companyName" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Company Name:</label>
                <div className="col-md-8">
                 {/* <p id="companyName" className="form-control border-0" value="AGRWAL INDUSTRIES navaghar vasai east near geta indersties" readOnly style={{ alignItems:'start' }} >AGRWAL INDUSTRIES navaghar vasai east near geta indersties gjhhiuhiuyu bgduyw bhgg bugwu hiu pabbhcwnkwuxbekzbf hwdw wheu jwhgebu wiueg jwb</p> */}
                  <textarea type="text" id="companyName" className="form-control border-0" value="AGRWAL INDUSTRIES navaghar vasai east near geta indersties" readOnly style={{ alignItems:'start' }} />
                </div>
              </div>
              
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="address" className="col-form-label col-md-4 fw-bold">Address:</label>
                <div className="col-md-8">
                  <textarea type="text" id="address" className="form-control border-0" value="123 Main Street, Cityville" readOnly style={{alignItems:'start' }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="gst" className="col-form-label col-md-4 fw-bold">GST:</label>
                <div className="col-md-8">
                  <input type="text" id="gst" className="form-control border-0" value="12ABCDE1234F1ZG" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="state" className="col-form-label col-md-4 fw-bold">State Name:</label>
                <div className="col-md-8">
                  <input type="text" id="state" className="form-control border-0" value="StateName" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="code" className="col-form-label col-md-4 fw-bold">Code:</label>
                <div className="col-md-8">
                  <input type="text" id="code" className="form-control border-0" value="123456" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="email" className="col-form-label col-md-4 fw-bold">E-Mail:</label>
                <div className="col-md-8">
                  <input type="email" id="email" className="form-control border-0" value="abc@example.com" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
            </div>


            <div className="col-md-6">
              <div className="row justify-content-start">
                <div className="col-md-6 border-end border-dark">
                  <div className="row ">
                    <label htmlFor="voucherNo" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Voucher No:</label>
                    <div className="col-md-8">
                      <input type="text" id="voucherNo" className="form-control border-0" value="INV-001" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="row ">
                    <label htmlFor="dated" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Dated:</label>
                    <div className="col-md-8">
                      <input type="text" id="dated" className="form-control border-0" value="2024-07-11" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row justify-content-start">
                <div className="col-md-6 border-end border-dark">
                  <div className="row ">
                    <label htmlFor="referenceNo" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Reference No & Date:</label>
                    <div className="col-md-8">
                      <input type="text" id="referenceNo" className="form-control border-0" value="REF-001, 2024-07-10" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="row ">
                    <label htmlFor="otherReference" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Other Reference:</label>
                    <div className="col-md-8">
                      <input type="text" id="otherReference" className="form-control border-0" value="SomeReference" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row justify-content-start">
                <div className="col-md-6 border-end border-dark">
                  <div className="row ">
                    <label htmlFor="dispatchedThrough" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Dispatched Through:</label>
                    <div className="col-md-8">
                      <input type="text" id="dispatchedThrough" className="form-control border-0" value="Courier" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="row ">
                    <label htmlFor="destination" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Destination:</label>
                    <div className="col-md-8">
                      <input type="text" id="destination" className="form-control border-0" value="DestinationName" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row justify-content-start">
                <div className="col-md-12">
                  <div className="row ">
                    <label htmlFor="termsOfDelivery" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Terms of Delivery:</label>
                    <div className="col-md-8">
                      <input type="text" id="termsOfDelivery" className="form-control border-0" value="Terms" readOnly style={{ alignItems:'start' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
<hr></hr>

          <div className="row justify-content-start mt-4">
            <div className="col-md-6 border-end border-dark">
              <h5 className="fw-bold"style={{ textAlign: "start" }}>Ship To:</h5>
              <div className="row ">
                <label htmlFor="shipCompanyName" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Company Name:</label>
                <div className="col-md-8">
                  <input type="text" id="shipCompanyName" className="form-control border-0" value="ADHIRAA Enterprises" readOnly style={{ alignItems: 'start' }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="shipAddress" className="col-form-label col-md-4 fw-bold">Address:</label>
                <div className="col-md-8">
                  <input type="text" id="shipAddress" className="form-control border-0" value="456 Oak Avenue, Townsville" readOnly style={{ alignItems: 'start' }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="shipGst" className="col-form-label col-md-4 fw-bold">GST:</label>
                <div className="col-md-8">
                  <input type="text" id="shipGst" className="form-control border-0" value="34FGHI5678J9KLM1N" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="shipState" className="col-form-label col-md-4 fw-bold">State Name:</label>
                <div className="col-md-8">
                  <input type="text" id="shipState" className="form-control border-0" value="StateName" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="shipCode" className="col-form-label col-md-4 fw-bold">Code:</label>
                <div className="col-md-8">
                  <input type="text" id="shipCode" className="form-control border-0" value="654321" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="shipEmail" className="col-form-label col-md-4 fw-bold">E-Mail:</label>
                <div className="col-md-8">
                  <input type="email" id="shipEmail" className="form-control border-0" value="xyz@example.com" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold"style={{ textAlign: "start" }}>Bill From:</h5>
              <div className="row ">
                <label htmlFor="billCompanyName" className="col-form-label col-md-4 fw-bold" style={{ textAlign: "start" }}>Company Name:</label>
                <div className="col-md-8">
                  <input type="text" id="billCompanyName" className="form-control border-0" value="ANUSHKAA Ltd." readOnly style={{ alignItems: 'start' }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="billAddress" className="col-form-label col-md-4 fw-bold">Address:</label>
                <div className="col-md-8">
                  <input type="text" id="billAddress" className="form-control border-0" value="789 Pine Street, Villageton" readOnly style={{ alignItems: 'start' }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="billGst" className="col-form-label col-md-4 fw-bold">GST:</label>
                <div className="col-md-8">
                  <input type="text" id="billGst" className="form-control border-0" value="45HIJK6789LMN123P" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="billState" className="col-form-label col-md-4 fw-bold">State Name:</label>
                <div className="col-md-8">
                  <input type="text" id="billState" className="form-control border-0" value="StateName" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="billCode" className="col-form-label col-md-4 fw-bold">Code:</label>
                <div className="col-md-8">
                  <input type="text" id="billCode" className="form-control border-0" value="987654" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
              <div className="row " style={{ textAlign: "start" }}>
                <label htmlFor="billEmail" className="col-form-label col-md-4 fw-bold">E-Mail:</label>
                <div className="col-md-8">
                  <input type="email" id="billEmail" className="form-control border-0" value="info@anushkaa.com" readOnly style={{ textAlign: "start" }} />
                </div>
              </div>
            </div>
          </div>

<hr></hr>
<br></br>
          <div className="container mt-4">
  <div className="table-responsive">
    <table className="table table-bordered table-with-vertical-lines">
      <thead className="table-light text-center">
        <tr>
          <th scope="col">Sr No</th>
          <th scope="col">Description of goods</th>
          <th scope="col">Delivery Date</th>
          <th scope="col">Quantity</th>
          <th scope="col">Rate</th>
          <th scope="col">Per</th>
          <th scope="col">Disc (%)</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Item 1</td>
          <td>2024-07-10</td>
          <td>2</td>
          <td>50</td>
          <td>Each</td>
          <td>5%</td>
          <td>100</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3" className="text-start fw-bold" >Total :</td>
          <td colSpan="1" ></td>
          <td colSpan="3" ></td>
          <td colSpan="1" >Rs 1000</td>
        </tr>
        <tr>
          <td colSpan="7" className="text-start fw-bold">Input CGST(9%) :</td>
          <td colSpan="1">205</td>
        </tr>
        <tr>
          <td colSpan="7" className="text-start fw-bold">Input SGST(9%) :</td>
          <td colSpan="1">350</td>
        </tr>
        <tr>
          <td colSpan="7" className="text-start fw-bold">Grand Total :</td>
          <td colSpan="1" className="fw-bold">Rs 1555</td>
        </tr>
        <tr>
          <td colSpan="2" className="fw-bold">Total Amount (in words) :</td>
          <td colSpan="6" className="text-end fw-bold">One Thousand Five Hundred Fifty Five Only</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div className="row mt-3" style={{ textAlign: "start" }}>
    <div className="col-md-6 border-end border-dark">
      <p> <b>Company's PAN:</b>12345566</p>
    </div>
    <div className="col-md-6">
      <p className="fw-bold">Authorized Sign:</p>
    </div>
  </div>
  </div>
</div>
<h6 className="text-center mt-3">This is a Computer Generated Document</h6>
       
      </div>
    </div>
  );
};

export default Pdfformate;