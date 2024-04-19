import express from 'express';
import nodemailer from 'nodemailer'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get("/bulkMailer", cors(), async (req, res) => {

    const filePath = './excel/orb.xlxs';
  
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
  
    const options = {
      header: 'A',
      range: 0,
    };
  
    const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);
  
    SendMailer(ExcelJson);
  
  })
  
  async function SendMailer(ExcelJson) {
  
    for (const el of ExcelJson) {
      try {
  
    //   const Hello = `<h2>Dear, ${el.B}</h2>`
  
      var htmlContent = fs.readFileSync(path.resolve( './orbsoft.html'), 'utf8');
      
    //   htmlContent = htmlContent.replace('{{message}}', msg);
  
     const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: 'update@gohoardings.com',
        pass: 'rkdz apjw blde dsck',
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  
  
    const mailOptions = {
      from: 'Gohoardings <update@gohoardings.com>',
      to: `${el.C}`,
      subject: 'Welcome to Odoads! Explore the exclusive features now',
      html: htmlContent
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
       
        return console.log(error);
      } else {
      
        return console.log('success');
      }
  });
  
      } catch (error) {
        console.error("An error occurred:", error);
      }
  
    }
  }

  app.listen(3333, () => {
    console.log("Yey, your server is running on port 3333");
  });