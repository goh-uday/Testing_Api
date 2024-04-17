import fetch from 'node-fetch';
import express from 'express';
const app = express();
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { json } from 'express';
import http from 'http';
import request from 'request';
import { error, log } from 'console';
import { resolveSoa } from 'dns';
import url from 'url';
import JSZip from 'jszip';
import path from 'path'
import pptx2json from 'pptxgenjs'
const pptx = new pptxgen();
import { extractText } from 'office-text-extractor'
import unzipper from 'unzipper';
import openXml from 'openxml';
import officegen from 'officegen';
import xml2js from 'xml2js';
import axios from 'axios';
import { google } from 'googleapis';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import Handlebars from 'handlebars';
import SVGtoPDF from 'svg-to-pdfkit';
import pdf from 'html-pdf';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs'; // fs.promises for async/await support
import { readFileSync, createReadStream } from 'fs';
import StaticMap  from 'google-static-map';
import Jimp from "jimp";
import nodemailer from 'nodemailer'
import moment from 'moment-timezone';
import cheerio from 'cheerio';

let https;
try {
  https = require('node:https');
} catch (err) {
  console.log('https support is disabled!');
}

app.use(cors());
app.use(express.json());

app.use("/test", express.static("./images"))


var poolCluster = mysql.createPoolCluster();



/********************
    JSON TO XLSX
*********************/

const students = [
  { name: "Raj", email: "raj@gmail.com", age: 23, gender: "M" },
  { name: "Rahul", email: "rahul@gmail.com", age: 15, gender: "M" }
]
const convertJsonToExcel = (data) => {
  const workSheet = XLSX.utils.json_to_sheet(data);
  const workBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workBook, workSheet, "students")
  // Generate buffer
  XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })

  // Binary string
  XLSX.write(workBook, { bookType: "xlsx", type: "binary" })
  const filePath = path.join(__dirname, './excel/', ""+data[0].medianame+".xlsx");
  // XLSX.writeFile(workBook, filePath)

}

/********************
    END OF XLSX
*********************/

/********************
    JSON TO PPTX
*********************/

const convertJsonToPPT = (data) => {

// 1. Create a new Presentation
let pres = new pptxgen();
pres.layout = 'LAYOUT_4x3';

// 2. Add a Slide
let slide1 = pres.addSlide();

// Image by local URL
slide1.addImage({ path: "images/headerppt.jpg",w:'100%', h:'100%' });

data.forEach(element => {
  const thumb = element.thumb.startsWith("https")
    ? element.thumb
    : `https://${element.mediaownercompanyname
        .trim()
        .split(" ")
        .slice(0, 2)
        .join("_")
        .toLowerCase()}.odoads.com/media/${element.mediaownercompanyname
        .trim()
        .split(" ")
        .slice(0, 2)
        .join("_")
        .toLowerCase()}/media/images/new${element.thumb}`;

  const slide = element.code = pres.addSlide();

  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.25,y: 2.25,w: 5.5,h: 4.5,fill: { color: "FFFFFF" }, shadow: {type: "outer",angle: 45,blur: 5,offset: 2,color: "808080"}});
  slide.addImage({ path: thumb ,w:'50%', h:'50%', x:'5%',y:'35%' });


  let textboxText = [
    { text: "Site name : "+element.medianame+"", options: { fontSize: 20, color: "000000", breakLine: true } },
    { text: "Media Type : "+element.subcategory+"", options: { fontSize: 20, color: "000000", breakLine: true } }
  ];
  let textboxText2 = [
    { text: "CAMPAIGN DETAILS OF", options: { fontSize: 24, color: "000000", breakLine: true , bold : true} },
  ];
  let textboxText3 = [
    { text: "SITE", options: { fontSize: 24, color: "000000", breakLine: true , bold : true} },
  ];
  let textboxText4 = [
    { text: "Name : "+element.medianame+"", options: { fontSize: 16, color: "000000", breakLine: true } },
    { text: "Media Type : "+element.subcategory+"", options: { fontSize: 16, color: "000000", breakLine: true } },
    { text: "Name : "+element.medianame+"", options: { fontSize: 16, color: "000000", breakLine: true } },
    { text: "Media Type : "+element.subcategory+"", options: { fontSize: 16, color: "000000", breakLine: true } },
    { text: "Name : "+element.medianame+"", options: { fontSize: 16, color: "000000", breakLine: true } },
    { text: "Media Type : "+element.subcategory+"", options: { fontSize: 16, color: "000000", breakLine: true } }
  ];
  slide.addShape(pptx.shapes.RECTANGLE, { x: '0%', y: '0%', w: '100%', h: '20%', fill: { color: "FFFF00" }, line: { type: "none" } });
  slide.addText(textboxText, { w:'100%',h:'20%', x:'3%',y:'0%', fontSize:24});
  slide.addText(textboxText2,{ w:'35%',h:'20%', x:'62%',y:'-2%', fontSize:24});
  slide.addText(textboxText3,{ w:'20%',h:'20%', x:'75%',y:'3%', fontSize:24});
  slide.addText(textboxText4,{ w:'35%',h:'20%', x:'65%',y:'23%', fontSize:16});
  slide.addShape(pptx.shapes.RECTANGLE, { x: '60%', y: '10%', w: '0.2%', h: '80%', fill: { color: "000000" }, line: { type: "none" } });
  slide.addShape(pptx.shapes.RECTANGLE, { x: '62%', y: '20%', w: '1.5%', h: '25%', fill: { color: "FFFF00" }, line: { type: "none" } });
  slide.addShape(pptx.shapes.RECTANGLE, { x: '65%', y: '80%', w: '30%', h: '2%', fill: { color: "000000" }, line: { type: "none" } });
  slide.addImage({ path: "images/logopng.png" ,w:'20%', h:'5%', x:'70%',y:'85%' });
});


let slide3 = pres.addSlide();
slide3.addImage({ path: "images/footerppt.jpg",w:'100%', h:'100%' });

// Shape with text
// let textboxText = [
//   { text: "Name : "+data+mediaid+"", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Media Type : "+data[0].mediatype+"", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "City : Delhi", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Location : RBK Sharma,Akshardham Footover Bridge, Pandav Nagar", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "GEO Location : 28.611350,77.281392", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Size : 20 X 10 feet", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Illumination : Frontlit", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Price : 110000.00", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Foot fall : 0", options: { fontSize: 12, color: "ffffff", breakLine: true } },
//   { text: "Slide Reference No : 3511", options: { fontSize: 12, color: "ffffff", breakLine: true } },
// ];


// slide2.addText(textboxText,{ shape: pres.ShapeType.rect, fill: { color: "FF0000" } ,w:'25%',h:'40%', x:'0%',y:'60%', fontSize:12});

// console.log(data[0].medianame);

// path of file to create and name
const filePath = "./pptx/dasd.pptx";

// 4. Save the Presentation
pres.writeFile(filePath);

}
/********************
    END OF PPTX
*********************/




const db = mysql.createConnection({
    multipleStatements: true,
    user: "root",
    host: "localhost",
    password: "",
    database: "gohoardi_goh",
  });
  const od = mysql.createConnection({
    multipleStatements: true,
    user: "root",
    host: "localhost",
    password: "",
    database: "odoads_tblcompanies",
  });
  const gc = mysql.createConnection({
    multipleStatements: true,
    user: "root",
    host: "localhost",
    password: "",
    database: "gohoardi_crmapp",
  });

  app.get("/", cors(), (req, res) => {
      res.send("Hello")
  });

  let data = [];

  app.get('/api/download', (req, res) => {
    console.log("run");
    const file = path.join(__dirname, './pptx/', 'Presentation.pptx');
    console.log(file);
  });
  
  app.get("/userdata", cors(), (req, res) => {
    const user = 5728;
    db.query(`SELECT * FROM goh_media Limit 1` , async (err, result) => {
      if (err) throw err;
        // convertJsonToExcel(result);
        convertJsonToPPT(result);
        return res.send(result)
    });
  });


/**************************************************** */

const delay = ms => new Promise(res => setTimeout(res, ms));

let data2 = [];
  app.get('/updateuser1/:userid', async (req,res) => {
    var userid = req.params.userid;

  db.query("SELECT mediatype, mediaid FROM goh_shopping_carts_item WHERE userid = ? ",[userid], async (err,result) => {
    if (err) throw err;
  result.forEach(element => {
          switch (element.mediatype) {
              case  "digital-media":
              cdb = "goh_media_digital";
              break;
              case "transit-media":
              cdb = "goh_media_transit";
              break;
              case "mall-media":
              cdb = "goh_media_mall";
              break;
              case "airport-media":
              cdb = "goh_media_airport";
              break;
              case "traditional-ooh-media":
              cdb = "goh_media";
              break;
              case "inflight_media":
              cdb = "goh_media_inflight";
              break;
              case "office-media":
              cdb = "goh_media_office";
              break;
              default:
              cdb = "goh_media";
              break;
          }
          
          db.query("SELECT category_name, code, medianame, location, ftf, page_title, keyword, meta_title, email, geoloc FROM "+ cdb +" WHERE code = ? ",[element.mediaid],  (err, result) => {
              if (err) throw err;
              setValue2(result)
          });     
        })
      //   const senddata = async () =>{
      //   await delay(100);
      //   return res.send(data2) && (data2 = []);
      // }
      // senddata();
      let data = [];
      // (async () => {
      //   for await (let num of data2) {
      //     data.push(num)
      //     console.log(data);
      //   }
      // })();
        (async () => {
          for await (const num of data2) {
            for (let index = 0; index < data2.length; index++) {
              data = data2[index];
            }
            return res.send(data) && (data = []);
          }
        })();

        // for(i=0;i>data2.length;i++){
        //   console.log(i)
        // }


      // return res.send(data2) && (data2 = []);
      // return console.log(data2);
    })
  });

  function setValue2(value) {
    value.forEach(obj => {
      data2.push(obj)
    })
  }

/*****************************************************/

app.get('/unsync', (req, res) => {
  db.changeUser({database : 'odoads_tblcompanies'}, function(err) {
    if (err) throw err;
  });
  db.query('SELECT code FROM tblcompanies WHERE db_created = "test"' , (err, result) => {
    if(err) throw err;
    result.forEach(element => {
      db.changeUser({database : 'odoads_'+element.code+''}, function(err) {
        if (err) throw err;
      });
      db.query('SELECT * FROM tblmedia_deails', (err,result) => {
        if(err) throw err;
        result.forEach(element2 => {
          element2['clientCode'] = element.code;
        })
        setValue(result);
      })
    });
    const senddata = async () =>{
      await delay(100);
      return res.send(data) && (data = [])
    }
    senddata();
  })
});

function setValue(params) {
  params.forEach(element => {
    data.push(element)
  });
}

/**************************************************** */

  app.get("/userid", cors(), (req, res) => {
    poolCluster.getConnection(function (err, connection) {
      if(err) console.log("error poll connection",err);
      let query = "SELECT tblcontacts.*, goh_shopping_carts_item.* FROM gohoardi_crmapp.tblcontacts tblcontacts JOIN gohoardi_goh.goh_shopping_carts_item goh_shopping_carts_item ON tblcontacts.userid = goh_shopping_carts_item.userid";
        db.query(query, function (error, results, fields) {
          console.log("fields ",fields)
          console.log("results ",results)
          if (error){
              console.log('error is ',error);
              return;
          }
      });
    });
  });

app.post('/get/ip/address', async (req, res) => {
  var fetch_res = req.ip
  // var fetch_data = await res.json()

  res.send(fetch_res)
})

app.get('/get/location', async (req, res) => {
  var adr = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyA5rrZLxs9YPXibrRNsjcxXU8-SChKScP4';

  var options = {
      host: adr,
      path: '/'
  }
  var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
          data += chunk;
      });
      res.on('end', function () {
          console.log(data);
      });
  });
  request.on('error', function (e) {
      console.log(e.message);
  });
  request.end();
})

app.get("/user/:id", cors(), (req, res) => {
    let id = req.params;
    db.query('SELECT * FROM goh_shopping_carts_item WHERE userid = ?',[id] , async (err, result) => {
      if (err) throw err;
      return console.log(result);
  });
});

app.get("/users", cors(), (req, res) => {
  db.changeUser({database : 'sql_login'}, function(err) {
    if (err) throw err;
  });
  db.query('SELECT * FROM users', async (err, result) => {
    if (err) throw err;
    return res.send(result);
});
});
/**********************************************************/

app.post("/toggle", cors(), (req, res) => {

  let toggle = req.body.toggleItem;

  db.changeUser({database : 'sql_login'}, function(err) {
    if (err) throw err;
  });

  db.query('SELECT * FROM users WHERE id = '+toggle+'', async (err, result) => {
    if (err) throw err;
    let toggleItem = result[0].isDelete;

    if (toggleItem == 0) {
      db.query('UPDATE users SET isDelete = 1 WHERE id = '+toggle+'', async (err, result) => {
        if (err) throw err;
        db.query('SELECT * FROM users', async (err, result) => {
          if (err) throw err;
          return res.send(result);;
        });
      });
    } else {
      db.query('UPDATE users SET isDelete = 0 WHERE id = '+toggle+'', async (err, result) => {
        if (err) throw err;
        db.query('SELECT * FROM users', async (err, result) => {
          if (err) throw err;
          return res.send(result);;
        });
      });
    }
  });
});

/**********************************************************/

// app.post("/api", cors(), (req, res) => {

//     code = req.body.code,
//     city = req.body.city,
//     location = req.body.location,
//     category = req.body.category,
//     subcategory = req.body.subcategory,
//     illumination = req.body.illumination,
//     company = req.body.company

//     var table_name='';

//     switch (category){

//         case 'traditional-ooh-media':
//           table_name ='goh_media'; 
//           break;
//         case 'digital-media':
//           table_name ='goh_media_digital'; 
//           break;
//         case "transit-media":
//           table_name = "goh_media_transit";
//           break;
//         case "mall-media":
//           table_name = "goh_media_mall";
//           break;
//         case "airport-media":
//           table_name = "goh_media_airport";
//           break;
//         case "inflight_media":
//           table_name = "goh_media_inflight";
//           break;
//         case "office-media":
//           table_name = "goh_media_office";
//           break;
//         default:
//           table_name = "goh_media";
//           break;
//     }

//     if(!code == '' || !city == '' || !location == '' || !category == '' || !subcategory == '' || !illumination == '' || !company == ''){
//       db.query('SELECT * FROM '+table_name+' WHERE code = ? OR city_name = ? AND (location = ? OR category_name = ? OR subcategory = ? OR illumination = ?) OR mediaownercompanyname = ?', [code, city, location, category, subcategory, illumination, company], (err, result) => {
//       if (err) {
//           console.log(err);
//         } else {
//           res.json({status: "success", res: result});
//         }
//       });
//     } else {
//         res.json({status: "error", error: "Media Not Found"})
//       }
// });

/********************************************************/

// let newdata;

// app.post("/api", cors(), (req, res) => {

//   code = req.body.code,
//   city = req.body.city,
//   location = req.body.location,
//   category = req.body.category,
//   subcategory = req.body.subcategory,
//   illumination = req.body.illumination,
//   company = req.body.company

//   var table_name='';
//   let alltables = ['goh_media', 'goh_media_digital', 'goh_media_transit', 'goh_media_mall', 'goh_media_airport', 'goh_media_inflight', 'goh_media_office'];
//   let where = [];

//   if (city) {
//     where.push(' city_name = "'+city+'"')
//   }
//   if (location) {
//     where.push(' location = "'+location+'"')
//   }
// if (category) {
//     switch (category){
//       case 'traditional-ooh-media':
//         table_name ='goh_media'; 
//         break;
//       case 'digital-media':
//         table_name ='goh_media_digital'; 
//         break;
//       case "transit-media":
//         table_name = "goh_media_transit";
//         break;
//       case "mall-media":
//         table_name = "goh_media_mall";
//         break;
//       case "airport-media":
//         table_name = "goh_media_airport";
//         break;
//       case "inflight_media":
//         table_name = "goh_media_inflight";
//         break;
//       case "office-media":
//         table_name = "goh_media_office";
//         break;
//   }
// }

//   if (subcategory) {
//     where.push(' subcategory = "'+subcategory+'"')
//   }
//   if (illumination) {
//     where.push(' illumination = "'+illumination+'"')
//   }

//   var sql = 'SELECT * FROM '+table_name+''

//   if (city || location || subcategory || illumination) {
//     sql += ' WHERE'
//   }

//   const conditionstring = ""+where+"";
//   var allconditions = conditionstring.replace(/,/g, ' AND');
//   const sqlquery = ""+sql+allconditions+"";

//   if (code || company) {
//     if (code) {
//       where.push('code = "'+code+'"')
//     }
//     if (company) {
//       where.push('mediaownercompanyname = "'+company+'"')
//     }
//     alltables.forEach(table_name =>{
//       const newquery = 'SELECT * FROM '+table_name+' WHERE '+where+''
//       db.query(newquery, async (err, result) => {
//         if (err) {
//           return res.json({status: "sqlerror", error: err})
//         } else {
//           result.forEach(obj => {
//             newdata.push(obj);
//           })
//         }
//       })
//     })
//     // console.log(newdata);
//     return res.json({status: "success", res: newdata}) && (newdata = [])
//   } else {
//   if(!city == '' || !location == '' || !category == '' || !subcategory == '' || !illumination == ''){
//   db.query(sqlquery, (err, result) => {
//     if (err) {
//         return res.json({status: "sqlerror", error: err})
//       } else if(result.length<0){
//         return res.json({status: "error", error: "Media Not Found"})
//       } else {
//         return res.json({status: "success", res: result});
//       }
//     });
//   } else {
//     res.json({status: "error", error: "Media Not Found"})
//   }
// }
// });

/********************************************************/
  app.post("/login", cors(), (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    db.query('SELECT * FROM users WHERE email = ?',[email], async (err, result) => {
      if(err) throw err;
         if(!result.length || !await bcrypt.compare(password, result[0].password)){
           return res.json({status:'error', error:"Incorrect Email and Password"})
          } else {
              return res.json({status:"success", Privlage:result[0]})
          }
      });
  });

  /*********************************************/
  let test = [];
  app.get("/test01", cors(), (req, res) => {
    var count = 0;
    db.changeUser({database : 'odoads_tblcompanies'}, function(err) {
      if (err) throw err;
    });
    db.query('SELECT * FROM tblcompanies WHERE db_created = "test"' , async (err, result) => {
      if (err) throw err;

      // if (result) {
      //   let output = [];
      //   await Promise.all(
      //     result.map(async channel => {
      //       // const channelEnterpriseId = await addChannel(
      //       //   req.body.enterpriseName,
      //       //   channel,
      //       //   knex
      //       // );
      //       output.push(channel);
      //     })
      //   );
      //   res.send(output);
      // }





    //   (async () => {
    //   for await(let element of result) {
    //     db.changeUser({database : 'odoads_'+element.code+''}, function(err) {
    //       if (err) throw err;
    //     });
    //     db.query('SELECT * FROM tblmedia_deails', async (err, result) => {
    //       test.push(result)
    //     });
    //   };
    // })().then(console.log(test))
    result.forEach(element => {
      db.changeUser({database : 'odoads_'+element.code+''}, function(err) {
        if (err) throw err;
      });
      db.query('SELECT * FROM tblmedia_deails', async (err, result) => {
        test.push(result)
      });
      count++;
    });
    if(test.length === 0){
      console.log("empty");
      // return res.send(test)
    }else{
      console.log("Not empty");
      return res.send(test)
    }
    });
  });

  /*********************************************/

//   app.get("/test001", cors(), (req, res) => {
//     // Configure array to store all promises
//     const promises = []

//     db.changeUser({database : 'odoads_tblcompanies'}, function(err) {
//       if (err) throw err;
//     });
//     db.query('SELECT * FROM tblcompanies WHERE db_created = "test"' , async (err, result) => {
//       if (err) throw err;
//     // Iterate through each item (this probably takes 0.001 seconds)
//     result.forEach(obj => {
//         // Run the query and store the ongoing request in the promises array
//         promises.push(new Promise((resolve, reject) => {
//           db.changeUser({database : 'odoads_'+obj.code+''}, function(err) {
//             if (err) throw err;
//           });
//             db.query('select * from tblmedia_deails WHERE syncstatus = "added"', (err, res) => {
//                 if (err) {
//                     // If there was an error, send it to reject which will be caught in the try/catch
//                     return reject(err)
//                 }

//                 // Return the success response
//                 resolve(res)
//             })
//         }))
//     })

//     // try/catch to handle any issues.
//     try {
//         // wait for all ongoing requests to finish and return either a response or error
//         const result = await Promise.all(promises)

//         // Return the result
//         res.send(result)
//     } catch (err) {
//         console.log(err)
        
//         // Send any error instead
//         res.status(500).send(err)
//     }
//   })
// })

  /*********************************************/

  app.get("/test001", cors(), (req, res) => {
    // Configure array to store all promises
    const promises = []

    db.changeUser({database : 'odoads_tblcompanies'}, function(err) {
      if (err) throw err;
    });
    db.query('SELECT * FROM tblcompanies WHERE db_created = "test"' , async (err, result) => {
      if (err) throw err;
    // Iterate through each item (this probably takes 0.001 seconds)
    result.forEach(obj => {
        // Run the query and store the ongoing request in the promises array
        db.changeUser({database : 'odoads_'+obj.code+''}, function(err) {
          if (err) throw err;
        });
        promises.push(new Promise((resolve, reject) => {
            db.query('select * from tblmedia_deails WHERE syncstatus = "added"', (err, result) => {
                if (err) {
                    // If there was an error, send it to reject which will be caught in the try/catch
                    return reject(err)
                }

                // Return the success response
                resolve(result)
            })
        }))
    })

    // try/catch to handle any issues.
    try {
        // wait for all ongoing requests to finish and return either a response or error
        const result = await Promise.allSettled(promises)

        let test = [];
        result.forEach(element => {
          element.value.forEach(obj => {
            test.push(obj);
          });
        });
        // Return the result
        res.send(test)
    } catch (err) {
        console.log(err)
        
        // Send any error instead
        res.status(500).send(err)
    }
  })
})

    /*********************************************/

    app.get('/updateuser/:userid', (req,res) => {
      var userid = req.params.userid;
      var table_name;
      // Configure array to store all promises
      const promises = []
    
      db.query("SELECT mediatype, mediaid FROM goh_shopping_carts_item WHERE userid = ? ",[userid], async (err,result) => {
        if (err) throw err;
      // Iterate through each item (this probably takes 0.001 seconds)
      result.forEach(element => {

        switch (element.mediatype) {
          case  "digital-media":
          table_name = "goh_media_digital";
          break;
          case "transit-media":
          table_name = "goh_media_transit";
          break;
          case "mall-media":
          table_name = "goh_media_mall";
          break;
          case "airport-media":
          table_name = "goh_media_airport";
          break;
          case "traditional-ooh-media":
          table_name = "goh_media";
          break;
          case "inflight_media":
          table_name = "goh_media_inflight";
          break;
          case "office-media":
          table_name = "goh_media_office";
          break;
          default:
          table_name = "goh_media";
          break;
      }

          // Run the query and store the ongoing request in the promises array
          promises.push(new Promise((resolve, reject) => {
            db.query("SELECT category_name, code, medianame, location, ftf, page_title, keyword, meta_title, email, geoloc FROM "+table_name+" WHERE code = ? ",[element.mediaid],  (err, res) => {
                  if (err) {
                      // If there was an error, send it to reject which will be caught in the try/catch
                      return reject(err)
                  }
  
                  // Return the success response
                  resolve(res)
              })
          }))
      })
  
      // try/catch to handle any issues.
      try {
          // wait for all ongoing requests to finish and return either a response or error
          const result = await Promise.all(promises)
  
          // Return the result
          res.send(result)
      } catch (err) {
          console.log(err)
          
          // Send any error instead
          res.status(500).send(err)
      }
    })
  })
  
    /*********************************************/

/*********************************************/

app.post("/api", cors(), async (req, res) => {

  db.changeUser({database : 'gohoardi_goh'}, function(err) {
    if (err) throw err;
  });

  code = req.body.code,
  city = req.body.city,
  location = req.body.location,
  category = req.body.category,
  subcategory = req.body.subcategory,
  illumination = req.body.illumination,
  company = req.body.company

  let multicity;
  let multisubcategory;
  var table_name='';
  let where = [];
  let multicityselect = [];
  let multisubselect = [];

  if (city) {
    multicity = city.split(",")
    if (multicity.length <= 1) {
      where.push(' city_name = "'+city+'"')
    } else {
      for (let i = 0; i < multicity.length; i++) {
        multicityselect.push(' city_name = "'+multicity[i]+'"')
      }
      var newtest = " ("+multicityselect+")"
      var testconditions = newtest.replace(/,/g, ' OR');
      where.push(testconditions)
    }
  }
  if (location) {
    where.push(' location = "'+location+'"')
  }
if (category) {
    switch (category){
      case 'traditional-ooh-media':
        table_name ='goh_media'; 
        break;
      case 'digital-media':
        table_name ='goh_media_digital'; 
        break;
      case "transit-media":
        table_name = "goh_media_transit";
        break;
      case "mall-media":
        table_name = "goh_media_mall";
        break;
      case "airport-media":
        table_name = "goh_media_airport";
        break;
      case "inflight_media":
        table_name = "goh_media_inflight";
        break;
      case "office-media":
        table_name = "goh_media_office";
        break;
  }
}

  if (subcategory) {
    multisubcategory = subcategory.split(",")
    if (multisubcategory.length <= 1) {
      where.push(' subcategory = "'+subcategory+'"')
    } else {
      for (let i = 0; i < multisubcategory.length; i++) {
        multisubselect.push(' subcategory = "'+multisubcategory[i]+'"')
      }
      var newtest = " ("+multisubselect+")"
      var testconditions = newtest.replace(/,/g, ' OR');
      where.push(testconditions)
    }
  }
  if (illumination) {
    where.push(' illumination = "'+illumination+'"')
  }

  var sql = 'SELECT * FROM '+table_name+''

  if (city || location || subcategory || illumination) {
    sql += ' WHERE'
  }

  const conditionstring = ""+where+"";
  var allconditions = conditionstring.replace(/,/g, ' AND');
  const sqlquery = ""+sql+allconditions+"";

  console.log(sqlquery);

  if (code || company) {
    if (code) {
      where.push('code = "'+code+'"')
    }
    if (company) {
      where.push('mediaownercompanyname = "'+company+'"')
    }
      const newquery = 'SELECT code FROM goh_media WHERE '+where+' UNION SELECT code FROM goh_media_mall WHERE '+where+' UNION SELECT code FROM goh_media_digital WHERE '+where+''
      db.query(newquery, async (err, result) => {
        if (err) {
          console.log(err);
        } else {
          return res.json({status: "success", res: result})
        }
      })
  } else {
  if(!city == '' || !location == '' || !category == '' || !subcategory == '' || !illumination == ''){
  db.query(sqlquery, (err, result) => {
    if (err) {
        return res.json({status: "sqlerror", error: err})
      } else if(result.length<0){
        return res.json({status: "error", error: "Media Not Found"})
      } else {
        return res.json({status: "success", res: result});
      }
    });
  } else {
    res.json({status: "error", error: "Media Not Found"})
  }
}
});

/**********************************************/

// var sql = "SELECT * FROM tblrolepermissions where roleid = 4 ORDER BY `tblrolepermissions`.`permissionid` ASC";
//   db.query(sql, function (err, result) {
//     if (err) throw err;
//     result.forEach(element => {
//       let roleid = element.roleid;
//       let permissionid = element.permissionid;
//       let can_view = element.can_view;
//       let can_view_own = element.can_view_own;
//       let can_edit = element.can_edit;
//       let can_create = element.can_create;
//       let can_delete = element.can_delete;
//       db.query("INSERT INTO tbl_role_permissions (role_id, permission_id, can_view, can_view_own, can_edit, can_create, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?)",[roleid, permissionid, can_view, can_view_own, can_edit, can_create, can_delete], function (err, result) {
//         if (err) throw err;
//         console.log("success");
//       });
//     });
//   });

// var sql = "INSERT INTO tbl_roles (role_id,role) VALUES (2 , 'accounts')"
//     db.query(sql, function (err, result) {
//         if (err) throw err;
//         db.query("SELECT role_id FROM tbl_roles WHERE role = 'accounts'", function (err, result) {
//           if (err) throw err;
//           db.query("SELECT * FROM tblrolepermissions where roleid = 2 ORDER BY `tblrolepermissions`.`permissionid` ASC", function (err, result) {
//             if (err) throw err;
//             result.forEach(element => {
//               let roleid = element.roleid;
//               let permissionid = element.permissionid;
//               let can_view = element.can_view;
//               let can_view_own = element.can_view_own;
//               let can_edit = element.can_edit;
//               let can_create = element.can_create;
//               let can_delete = element.can_delete;
//               db.query("INSERT INTO tbl_role_permissions (role_id, permission_id, can_view, can_view_own, can_edit, can_create, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?)",[roleid, permissionid, can_view, can_view_own, can_edit, can_create, can_delete], function (err, result) {
//                 if (err) throw err;
//                 console.log("success");
//             });
//           });
//         });
//       });
//     });

// let staff_id = 1;
// db.query("SELECT * FROM tbl_role_permissions WHERE role_id = 4", function (err, result) {
//   if (err) throw err;
//   result.forEach(element => {
//     let roleid = element.role_id;
//     let permissionid = element.permission_id;
//     let can_view = element.can_view;
//     let can_view_own = element.can_view_own;
//     let can_edit = element.can_edit;
//     let can_create = element.can_create;
//     let can_delete = element.can_delete;
//     var sql = "INSERT INTO tbl_staff_permissions (role_id, permission_id, staff_id, can_view, can_view_own, can_edit, can_create, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
//     db.query(sql, [roleid, permissionid, staff_id, can_view, can_view_own, can_edit, can_create, can_delete] , function (err, result) {
//       if (err) throw err;
//     })
//   });
// })

// let staff_id = 1;
// let rid = 2;
// db.query("SELECT staff_id FROM tbl_staff_permissions WHERE staff_id = "+staff_id+" LIMIT 1", function (err, result) {
//   if (err) throw err;
//  if (result.length>0) {
//   db.query("SELECT * FROM tbl_role_permissions WHERE role_id = "+rid+"", function (err, result) {
//     if (err) throw err;
//     result.forEach(element => {
//       let roleid = element.role_id;
//       let permissionid = element.permission_id;
//       let can_view = element.can_view;
//       let can_view_own = element.can_view_own;
//       let can_edit = element.can_edit;
//       let can_create = element.can_create;
//       let can_delete = element.can_delete;
      
//       db.query("UPDATE tbl_staff_permissions SET role_id = "+roleid+", can_view = "+can_view+", can_view_own = "+can_view_own+", can_edit = "+can_edit+", can_create = "+can_create+", can_delete = "+can_delete+" WHERE staff_id = "+staff_id+" AND permission_id = "+permissionid+"", function (err, result) {
//         if (err) throw err;
//       });
//     });
//   });
//  } else {
//   db.query("SELECT * FROM tbl_role_permissions WHERE role_id = "+rid+"", function (err, result) {
//     if (err) throw err;
//     result.forEach(element => {
//       let roleid = element.role_id;
//       let permissionid = element.permission_id;
//       let can_view = element.can_view;
//       let can_view_own = element.can_view_own;
//       let can_edit = element.can_edit;
//       let can_create = element.can_create;
//       let can_delete = element.can_delete;
      
//       db.query("INSERT INTO tbl_staff_permissions (role_id, permission_id, staff_id, can_view, can_view_own, can_edit, can_create, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [roleid, permissionid, staff_id, can_view, can_view_own, can_edit, can_create, can_delete] , function (err, result) {
//         if (err) throw err;
//       });
//     });
//   });
//  }
// });

  app.get("/test002", cors(), (req, res) => {
    let staff_id = 1;
    let rid = 2;
    db.query("SELECT staff_id FROM tbl_staff_permissions WHERE staff_id = "+staff_id+" LIMIT 1", function (err, result) {
      if (err) throw err;
     if (result.length>0) {
      db.query("SELECT * FROM tbl_role_permissions WHERE role_id = "+rid+"", function (err, result) {
        if (err) throw err;
        result.forEach(element => {
          let roleid = element.role_id;
          let permissionid = element.permission_id;
          let can_view = element.can_view;
          let can_view_own = element.can_view_own;
          let can_edit = element.can_edit;
          let can_create = element.can_create;
          let can_delete = element.can_delete;
          
          db.query("UPDATE tbl_staff_permissions SET role_id = "+roleid+", can_view = "+can_view+", can_view_own = "+can_view_own+", can_edit = "+can_edit+", can_create = "+can_create+", can_delete = "+can_delete+" WHERE staff_id = "+staff_id+" AND permission_id = "+permissionid+"", function (err, result) {
            if (err) throw err;
          });
        });
      });
     } else {
      db.query("SELECT * FROM tbl_role_permissions WHERE role_id = "+rid+"", function (err, result) {
        if (err) throw err;
        result.forEach(element => {
          let roleid = element.role_id;
          let permissionid = element.permission_id;
          let can_view = element.can_view;
          let can_view_own = element.can_view_own;
          let can_edit = element.can_edit;
          let can_create = element.can_create;
          let can_delete = element.can_delete;
          
          db.query("INSERT INTO tbl_staff_permissions (role_id, permission_id, staff_id, can_view, can_view_own, can_edit, can_create, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [roleid, permissionid, staff_id, can_view, can_view_own, can_edit, can_create, can_delete] , function (err, result) {
            if (err) throw err;
          });
        });
      });
     }
    });
  });

  app.get("/test005", cors(), (req, res) => {
    let rid = 2;
      db.query("SELECT * FROM tbl_role_permissions WHERE role_id = "+rid+"", function (err, result) {
        if (err) throw err;
        res.send(result)
    });
  });
/**********************************************/

let test000 = [];
var R = 6371;
app.get("/test003", cors(), (req, res) => {
  db.query("SELECT * FROM goh_media LIMIT 600", function (err, res1) {
    if (err) throw err;
    db.query("SELECT * FROM goh_media_mall LIMIT 500", function (err, res2) {
      if (err) throw err;

      res1.forEach(obj1 => {
        res2.forEach(obj2 => {
        let lat1 = obj1.latitude;
        let lon1 = obj1.longitude;
        let lat2 = obj2.latitude;
        let lon2 = obj2.longitude;

        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        if (d < 5) {
          test000.push(obj2)
        }
        });
      });
      res.send(test000) && (test000 = [])
    });
  });
}) 

/**********************************************************/

app.get("/test004", cors(), async (req, res) => {
  const promises = []
  var tres = [];
  let locations = ['restaurant', 'hospital', 'school', 'cinema', 'hotel', 'bar', 'gym', 'spa']
  db.changeUser({database : 'gohoardi_goh'}, function(err) {
    if (err) throw err;
  });
  db.query("SELECT * FROM media_points WHERE exc = 1 LIMIT 250", async function (err, medpoints) {
    if (err) throw err;
    medpoints.forEach(({lat,lng,city_name}) => {

      db.query("UPDATE media_points SET exc = 0 WHERE lat="+lat+"", function (err, result3) {
        if (err) throw err;
      })
      var count = 1;
    var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&type=spa&radius=2000&key=AIzaSyAYkchdPoe5HqvV7RhgrXdC81-d8Mo-uC0';
    let settings = { method: "Get" };
    promises.push(new Promise((resolve, reject) => {
      fetch(url, settings)
      .then(res => res.json())
      .then((res) => {
        var data = res.results;
        data.forEach(data => {
          let photo;  let name;
              if (data.photos) {
                photo = data.photos[0].photo_reference;
              } else {
                photo = "not found";
              }
              if (data.rating) {
                rating = data.rating;
              } else {
                rating = '"not found"';
              }
              if (data.user_ratings_total) {
                user_ratings_total = data.user_ratings_total;
              } else {
                user_ratings_total = '"not found"';
              }

              let rest = "spa"

              let oldname = data.name
              let newname = oldname.replace(/['"]+/g, '');

              let insert_data = '( "' + newname + '",'+data.geometry.location.lat+','+data.geometry.location.lng+',"'+data.business_status+'","'+photo+'",'+rating+','+user_ratings_total+',"'+rest+'","'+data.place_id+'","'+city_name+'","'+lat+'")'
              sql = "INSERT INTO `testing_only_spas` ( `name`, `lat`, `lng`, `status`, `photo`, `rating`, `total-rating`, `Type`, `place_id` , `city_name`, `mp_lat`) VALUES"
          db.query(sql+ insert_data, function (err, res3) {
            if (err){
              console.log(err);
            };
          })
        });
        resolve(res)
      });
    }))
  })
        // try/catch to handle any issues.
        try {
          // wait for all ongoing requests to finish and return either a response or error
          const result = await Promise.all(promises)
          // Return the result


          // result.forEach(e => {
          //   db.query("INSERT INTO media_points SET lat = "+element.latitude+" , lng = "+element.longitude+"", function (err, result) {
          //             if (err) throw err;
          //           })
          // });

      } catch (err) {
          console.log(err)
          
          // Send any error instead
          res.status(500).send(err)
      }
});
})

app.post("/test111", cors(), async (req, res) => {

  let otp = Math.floor(100000 + Math.random() * 900000);

  request({
    url: 'https://api.msg91.com/api/sendhttp.php',
    method: 'POST',
    form: {
      'authkey': '280862A8xB5Zeo9OK45d020be9',
      'mobiles': '919718345420',
      'message': ''+otp+' is your one-time OTP for login into the Gohoardings account.',
      'sender': 'GOHOOH',
      'route': '4',
      'DLT_TE_ID' : '1307165770131175060'
    }
  }, function(error, response, body) {
    if (error) {
      res.send(err)
    } else {
      res.send(body);
    }
  });
  
  

  // public function send_sms($mobileNumber, $sms, $authKey="280862A8xB5Zeo9OK45d020be9", $senderId="GOHOOH"){
				
	// 	//Your message to send, Add URL encoding here.
  //   let otp = Math.floor(100000 + Math.random() * 900000);
  //   let sms = ""+otp+" is your one-time OTP for login into the Gohoardings account."
	// 	let message = encodeURI(sms);
		
	// 	//Define route 
	// 	$route = 4;
	// 	//Prepare you post parameters
	// 	let post = {
	// 		"authkey" : "280862A8xB5Zeo9OK45d020be9",
	// 		"mobiles" : 9654024245,
	// 		"message" : message,
	// 		"sender" : "GOHOOH",
	// 		'route' : 4
  //   };
		
	// 	//API URL
	// 	let url = "https://api.msg91.com/api/sendhttp.php";
		
	// 	// init the resource
	// 	$ch = curl_init();
	// 	curl_setopt_array($ch, array(
	// 		CURLOPT_URL => $url,
	// 		CURLOPT_RETURNTRANSFER => true,
	// 		CURLOPT_POST => true,
	// 		CURLOPT_POSTFIELDS => $postData
	// 	));
		
	// 	//Ignore SSL certificate verification
	// 	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	// 	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		
	// 	//get response
	// 	$output = curl_exec($ch);
		
	// 	//Print error if any
	// 	if(curl_errno($ch)){
	// 		echo 'error:' . curl_error($ch);
	// 	}
		
	// 	curl_close($ch);
		
	// 	return output;
	// }
})

/**********************************************************/
/**********************************************************/

app.get("/test006", cors(), async (req, res) => {
  let count = 0;
      db.query("SELECT * FROM goh_media_transit WHERE exc = 1 LIMIT 1",(err,res1) => {
        // update the value
        console.log(res1[0].id)
        db.query("UPDATE goh_media_digital SET exc = 1 WHERE id = "+result[0].id+"", function (err, res2) {
            if (err) throw err;
          })

        // if res exist
        // call himself
        // else
        // return
        if (res1.length > 0) {
          count = count + 1;
        } else {
          return console.log(count);
        }
      })

      db.query("UPDATE goh_media_digital SET exc = 1 WHERE id = "+result[0].id+"", function (err, res1) {
        if (err) throw err;
      })
      var tables = ['goh_media','goh_media_digital','goh_media_mall','goh_media_transit','goh_media_airport']

      tables.forEach(tbl => {

        var sqlquery = "SELECT *, ( 3959 * acos(cos( radians( '"+result[0].latitude+"' ) ) *cos( radians( `latitude` ) ) *cos(radians( `longitude` ) - radians( '"+result[0].longitude+"' )) +sin(radians('"+result[0].latitude+"')) *sin(radians(`latitude`)))) `distance` FROM `"+tbl+"` HAVING `distance` < '1' AND exc = 0";
        db.query(sqlquery, function (err, array) {
          if (err) throw err;
          array.forEach(element => {
            db.query("UPDATE "+tbl+" SET exc = 2 WHERE id = "+element.id+"", function (err, result) {
              if (err) throw err;
            })
          });
        })
      });
})

app.get("/test007", cors(), async (req, res) => {


      db.query("SELECT * FROM media_points", function (err, array) {
        if (err) throw err;
        array.forEach(element => {
          db.query("SELECT * FROM goh_media WHERE lat = "+element.lat+" , lng = "+element.lng+"", function (err, result) {
            if (err) throw err;
          })
        });
      })

  var tables = ['goh_media','goh_media_digital','goh_media_mall','goh_media_transit','goh_media_airport']
  tables.forEach(tbl => {
    var sqlquery = "SELECT latitude, longitude FROM "+tbl+" WHERE exc = 1";
    db.query(sqlquery, function (err, array) {
      if (err) throw err;
      array.forEach(element => {
        db.query("INSERT INTO  SET lat = "+element.latitude+" , lng = "+element.longitude+"", function (err, result) {
          if (err) throw err;
        })
      });
    })
  });
})

let count = 0;

app.get("/test101", cors(), async (req, res) => {
  db.query("SELECT * FROM media_points where exc = 0", function (err, array) {
    if (err) throw err;
    array.forEach(element => {
      db.query("SELECT city_name, latitude FROM goh_media WHERE latitude = "+element.lat+" AND longitude = "+element.lng+"", function (err, result) {
        if (err) throw err;
        if (result[0]) {
          console.log(count++);
          db.query("UPDATE media_points SET exc = 1, city_name = '"+result[0].city_name+"' WHERE mp_lat="+result[0].latitude+"", function (err, result) {
            if (err) throw err;
            console.log("err");
          })
        }
      })
    });
  })
})


app.get("/test008", cors(), async (req, res) => {
  var table = 'goh_media';
  var type = 'restaurants';
  var distance = '2';
  

      var sqlquery = "SELECT *, ( 3959 * acos(cos( radians( '28.610559' ) ) *cos( radians( `latitude` ) ) *cos(radians( `longitude` ) - radians( '77.280674' )) +sin(radians('28.610559')) *sin(radians(`latitude`)))) `distance` FROM `goh_media` HAVING `distance` < '1' ORDER BY `distance` LIMIT 125";
      db.query(sqlquery, function (err, array) {
        if (err) throw err;
        array.forEach(element => {
          db.query("INSERT INTO  SET lat = "+element.latitude+" , lng = "+element.longitude+"", function (err, result) {
            if (err) throw err;
          })
        });
      })



})

app.get("/test009", cors(), async (req, res) => {
  db.query("SELECT * FROM media_points WHERE exc = 1",(err,results) => {
    if (results.length > 0) {
      // var tables = ['goh_media','goh_media_digital','goh_media_mall','goh_media_transit','goh_media_airport']
      var tables = ['goh_media']

      results.forEach(result => {

        db.query("UPDATE media_points SET exc = 0 WHERE id="+result.id+"", function (err, result3) {
          if (err) throw err;
        })

        // tables.forEach(tbl => {
          var sqlquery = "SELECT *, ( 3959 * acos(cos( radians( '"+result.lat+"' ) ) *cos( radians( `latitude` ) ) *cos(radians( `longitude` ) - radians( '"+result.lng+"' )) +sin(radians('"+result.lat+"')) *sin(radians(`latitude`)))) `distance` FROM goh_media HAVING `distance` < '1'";
          db.query(sqlquery, function (err, array) {
            if (err) throw err;
            array.forEach(element => {
              let latt = result.lat;
              let elid = element.id;
              db.query("UPDATE goh_media_airport SET mp_lat = "+latt+" WHERE id="+elid+"", function (err, result2) {
                if (err) throw err;
                console.log(latt);
                console.log(elid);
              })
            });
          })
        // });
      });
    } 
  })
})


app.get("/test010", cors(), async (req, res) => {
  db.query("SELECT * FROM media_points",(err,results) => {
    if (results.length > 0) {
      // var tables = ['goh_media','goh_media_digital','goh_media_mall','goh_media_transit','goh_media_airport']
      var tables = ['goh_media']

      results.forEach(result => {

        db.query("UPDATE media_points SET exc = 3 WHERE id="+result.id+"", function (err, result3) {
          if (err) throw err;
        })

        // tables.forEach(tbl => {
          var sqlquery = "SELECT *, ( 3959 * acos(cos( radians( '"+result.lat+"' ) ) *cos( radians( `lat` ) ) *cos(radians( `lng` ) - radians( '"+result.lng+"' )) +sin(radians('"+result.lat+"')) *sin(radians(`lat`)))) `distance` FROM testing_only_restaurants HAVING `distance` < '1'";
          db.query(sqlquery, function (err, array) {
            if (err) throw err;
            array.forEach(element => {
              let latt = result.lat;
              let elid = element.id;
              db.query("UPDATE testing_only_restaurants SET mp_lat = "+latt+" WHERE id="+elid+"", function (err, result2) {
                if (err) throw err;
                console.log(latt);
                console.log(elid);
              })
            });
          })
        // });
      });
    } 
  })
})





let counter = 0;
function recursive() {
  db.query("SELECT * from goh_media where exc = 0 limit 1",(err,result) => {
    if (result.length > 0) {
      db.query("UPDATE goh_media SET exc = 1 WHERE id = "+result[0].id+"", function (err, res2) {
        if (err) throw err;
      })
      var tables = ['goh_media','goh_media_digital','goh_media_mall','goh_media_transit','goh_media_airport']
      tables.forEach(tbl => {
        var sqlquery = "SELECT *, ( 3959 * acos(cos( radians( '"+result[0].latitude+"' ) ) *cos( radians( `latitude` ) ) *cos(radians( `longitude` ) - radians( '"+result[0].longitude+"' )) +sin(radians('"+result[0].latitude+"')) *sin(radians(`latitude`)))) `distance` FROM `"+tbl+"` HAVING `distance` < '1' AND exc = 0";
        db.query(sqlquery, function (err, array) {
          if (err) throw err;
          array.forEach(element => {
            db.query("UPDATE "+tbl+" SET exc = 2 WHERE id = "+element.id+"", function (err, result) {
              if (err) throw err;
            })
          });
        })
      });
      ++counter
      recursive()
    } else {
      return console.log(counter);
    }
  })
}
/**********************************************************/


/********************
    TESTING 001
*********************/

app.get("/test00001", cors(), async (req, res) => {

const pptxFile = './ppt/TEST16.pptx';
const pptxData = fs.readFileSync(pptxFile);

fs.mkdir('test/file16', { recursive: true }, (err) => {
  if (err) throw err;
});

const text = await extractText(pptxFile)
fs.writeFileSync('./test/file16/file.txt', text);


// Load the PPTX data into a JSZip instance
const zip = await JSZip.loadAsync(pptxData);

// Get all the images from the "ppt/media" directory
const images = zip.folder('ppt/media').files;

// Loop through each image file and extract it to a new file
for (const imageFile of Object.keys(images)) {
  // Get the slide number from the filename

  // console.log(imageFile);

  const slideMatch = imageFile.match(/\/image(\d+)\.(jpeg|jpg|png)$/i);
  if (slideMatch) {
    const slideNumber = slideMatch[1];
    // Extract the image data from the zip file
  const imageData = await images[imageFile].async('nodebuffer');

  // Save the image to a file with a descriptive name
  fs.mkdir('test/file16/images', { recursive: true }, (err) => {
    if (err) throw err;
  });

  const imageName = `./test/file16/images/image${slideNumber}.jpg`;
  fs.writeFileSync(imageName, imageData);
  }else {
    // console.log(`File ${imageFile} is not a slide image.`);
  }
  
}

});

app.get("/test00002", cors(), async (req, res) => {
  // read the contents of a file located in the ./test/file1 directory
  const text = fs.readFileSync('./test/file3/file.txt', 'utf8');

  // switch to a different database schema (in this case, 'sql_login')
  db.changeUser({database : 'gohoardi_goh'}, function(err) {
    if (err) throw err;
  });

  // split the contents of the file into rows using '---' as the delimiter
  const rows = text.split('---');
  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    // split each row into columns using ',' as the delimiter
    const columns = rows[i].split(',');
    let column1 = '';
    let column2 = '';
    if (rows[i].includes("LOCATION") && rows[i].includes("SIZE")) {
      // if row follows the second format, extract column1 and column2 accordingly
      const pattern = /\(00\)[^:]*:\s*([^:]*)/;
      const match1 = text.match(pattern);

      column1 = match1 ? match1[1].trim() : "";
      column2 = rows[i+1] ? rows[i+1].split(":")[1]?.trim().split(",")[0].trim() : "";
    } else if (columns.length >= 2) {
      // concatenate all elements except for the last one as column1 data
      column1 = columns.slice(0, columns.length - 1).join(',');
      // use a regular expression to extract the two numeric values from the last element of the row
      const regex = /(-?\d+(\.\d+)?)\s*x\s*(-?\d+(\.\d+)?)/;
      const match = regex.exec(columns[columns.length - 1]);
      if (match) {
        column2 = [parseFloat(match[1]), parseFloat(match[3])];
      }
    } else if (columns.length === 1) {
      // if there's only one element, treat it as column1 data
      column1 = columns[0];
    }
    // check if column1 data has both characters and numbers
    if (/[a-zA-Z]/.test(column1) && column2?.length > 0) {
      // construct a SQL INSERT statement using the column data
      const sql = `INSERT INTO aa_test (a, b) VALUES ('${column1}', '${column2}')`;
      // execute the SQL statement using the MySQL database connection
      db.query(sql, function (err, result) {
        if (err) throw err;
        count++;
        if (count === rows.length) {
          // if all rows have been inserted, send a response to the client
          res.send('All columns inserted successfully');
        }
      });
    } else {
      // if column1 data does not contain both characters and numbers, skip insertion
      count++;
      if (count === rows.length) {
        // if all rows have been inserted, send a response to the client
        res.send('All columns inserted successfully');
        }
      }
  }
});









app.get("/test00003", cors(), async (req, res) => {

  // Load PowerPoint file
const filePath = './ppt/TEST1.pptx';
fs.createReadStream(filePath)
  .pipe(unzipper.Parse())
  .on('entry', (entry) => {
    if (entry.path.startsWith('ppt/slides/slide')) {
      let xmlData = '';

      entry.on('data', (data) => {
        xmlData += data.toString();
      });

      entry.on('end', () => {
        // Parse slide data as XML and extract text and images
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseStringPromise(xmlData).then((result) => {
          const slide = result['p:sld'];
          const slideIndex = slide['$']['id'];

          // Extract text from slide
          const textData = [];
          if (slide['p:txBody']) {
            const textElements = slide['p:txBody']['a:p'];
            if (Array.isArray(textElements)) {
              textElements.forEach((element) => {
                const text = element['a:r']['a:t'];
                if (text) {
                  textData.push(text);
                }
              });
            } else if (textElements && textElements['a:r'] && textElements['a:r']['a:t']) {
              textData.push(textElements['a:r']['a:t']);
            }
          }
          console.log(`Slide ${slideIndex} text data:`, textData);

          // Extract images from slide
          const imageData = [];
          if (slide['p:spTree']) {
            const imageElements = slide['p:spTree']['p:pic'];
            if (Array.isArray(imageElements)) {
              imageElements.forEach((element) => {
                const imageDataElement = element['p:blipFill']['a:blip'];
                if (imageDataElement) {
                  const imageDataId = imageDataElement['$']['r:embed'];
                  imageData.push({
                    id: imageDataId,
                    data: null
                  });
                }
              });
            } else if (imageElements && imageElements['p:blipFill'] && imageElements['p:blipFill']['a:blip']) {
              const imageDataId = imageElements['p:blipFill']['a:blip']['$']['r:embed'];
              imageData.push({
                id: imageDataId,
                data: null
              });
            }
          }
          console.log(`Slide ${slideIndex} image data:`, imageData);
        });
      });
    } else {
      entry.autodrain();
    }
  });
})
app.get("/test00004", cors(), async (req, res) => {
  const inputFilePath = './ppt/TEST1.pptx';
const outputDirectory = './test';

const inputPptx = officegen('pptx');
const outputPptx = officegen('pptx');

// Load the input PowerPoint file
let buffer = fs.readFileSync(inputFilePath)
console.log(buffer);
inputPptx.generate(buffer);

// Iterate over each slide in the input file
const slideCount = inputPptx.slides.length;

for (let i = 0; i < slideCount; i++) {
  const inputSlide = inputPptx.slides[i];

  // Create a new output PowerPoint document with one slide
  const outputSlide = outputPptx.makeSlide();

  // Copy the shapes from the input slide to the output slide
  const shapeCount = inputSlide.shapes.length;
  for (let j = 0; j < shapeCount; j++) {
    const inputShape = inputSlide.shapes[j];
    outputSlide.addShape(inputShape);
  }

  // Add the output slide to the output PowerPoint document
  outputPptx.slides.push(outputSlide);

  // Save the output PowerPoint document as a new file
  const outputFileName = `slide${i + 1}.pptx`;
  outputPptx.generate(fs.createWriteStream(path.join(outputDirectory, outputFileName)));
}
})

/********************
    END OF TEST
*********************/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.get("/testing002", cors(), async (req, res) => {

const accessToken = 'ya29.a0AWY7CknDFrFZHYYMFEMLmvGq5GiyWUu8tA4F5Ew3_9ECInRE916SJRGprosOHMoU2wQkRoQUcYstZVm8SCrMohGqBqoexdqAyRJhPDqZ0JHxfI9fI3p5Iljx6cL5KkpDTgyHcYZLMURIK0mOvVRJcG4Tt4ImaCgYKAf4SARESFQG1tDrpZEDcyvSdB1Nmh_8_O3Ai_w0163';
const apiUrl = 'https://www.googleapis.com/drive/v3/about?fields=*';

fetch(apiUrl, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });


})

app.get("/testing003", cors(), async (req, res) => {

// Set your API key
const apiKey = 'AIzaSyDEKx_jLb_baUKyDgkXvzS_o-xlOkvLpeE';

// Create the Drive client
const drive = google.drive({ version: 'v3', auth: apiKey });

async function downloadImage(fileId, destinationPath) {
  const dest = fs.createWriteStream(destinationPath);

  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  response.data
    .on('end', () => {
      console.log('Image downloaded successfully');
    })
    .on('error', (err) => {
      console.error('Error downloading the image:', err);
    })
    .pipe(dest);
}

// Usage: Provide the file ID and destination path
const fileId = '18upiP1C2_rb0Pg0HQf5lGFphOL_n_ad7';
const destinationPath = './newimages/image.jpg';
downloadImage(fileId, destinationPath);
  
  })

app.get("/testing004", cors(), async (req, res) => {
  
// Load the invoice template
const template = fs.readFileSync('invoice-template.hbs', 'utf-8');

// Compile the template
const compiledTemplate = Handlebars.compile(template);

// Prepare the invoice data
const invoiceData = {
  items: [
    { SNO : '1', Description : 'Location 01_Non Lit', HSN : '998361',Size : '3x4',Area : '12',Quantity : '2',Rate : '1.00',Uom : 'NOS',Amount : '24.00'},
    { SNO : '1', Description : 'Location 01_Non Lit', HSN : '998361',Size : '3x4',Area : '12',Quantity : '2',Rate : '1.00',Uom : 'NOS',Amount : '24.00'}
  ],
};

// Render the template with the invoice data
const renderedHtml = compiledTemplate(invoiceData);

// Set the options for pdf creation
const pdfOptions = {
  format: 'Letter',
};

// Create the PDF from the rendered HTML
pdf.create(renderedHtml, pdfOptions).toFile('invoice1.pdf', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Invoice PDF created successfully');
  }
});

});


app.get("/testing001", cors(), async (req, res) => {

  const filePath = './excel/bqs.xlsx';

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const options = {
    header: 'A',
    range: 1,
  };

  const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);

  ExcelExtractor(ExcelJson);

})

async function generateCode(name) {
  if (name && name.trim() !== '') {
    const words = name.split(' ');
    if (words.length === 1) {
      return `${name.toLowerCase()}`;
    } else if (words.length >= 2) {
      const firstTwoWords = words.slice(0, 2).join('_');
      return firstTwoWords.toLowerCase();
    }
  }
  return 'default_folder';
}

async function copyFolderWithCustomName(sourceFolder, destinationFolder, name, isRoot = true) {
  const newFolderName = isRoot ? await generateCode(name) : path.basename(sourceFolder);
  const newFolderPath = path.join(destinationFolder, newFolderName);

  try {
    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, { recursive: true });
    }

    const filesAndSubfolders = fs.readdirSync(sourceFolder);

    for (const item of filesAndSubfolders) {
      const sourcePath = path.join(sourceFolder, item);
      const destinationPath = path.join(newFolderPath, item);

      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destinationPath);
      } else if (fs.statSync(sourcePath).isDirectory()) {
        copyFolderWithCustomName(sourcePath, newFolderPath, name, false);
      }
    }
    return newFolderName;
  } catch (err) {
    console.error('Error copying folder:', err);
  }
}

async function getRandomFileName() {
  const randomNumbers = Math.floor(Math.random() * 10000000);
  return `image_${randomNumbers}.jpeg`;
};

async function replace(inputString) {
  let result = inputString.replace(/[\/\s]+/g, '-');
  result = result.replace(/-+/g, '-');
  return result;
}

async function checkIdExists(id) {
  return new Promise((resolve, reject) => {
    const checkSql = `SELECT id FROM goh_bqs_audit WHERE id = ${id}`;
    db.query(checkSql, (error, results) => {
      if (error) {
        console.error('Error checking if ID exists:', error);
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

async function ExcelExtractor(ExcelJson) {
  db.changeUser({ database: 'gohoardi_goh' }, function (err) {
    if (err) throw err;
  });

  const maxRowsPerBatch = 2200;
  let count = 0;

  for (const el of ExcelJson) {
    try {
    if (count === maxRowsPerBatch) {
      await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000));
      count = 0;
    }

    const idExists = await checkIdExists(el.A);

      if (idExists) {
        console.log(`Skipping row with ID ${el.A} as it already exists in the database.`);
        continue;
      }


    async function downloadImage(url, destinationPath) {
      return new Promise(async (resolve, reject) => {
        const dest = fs.createWriteStream(destinationPath);
    
        try {
          const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream',
          });
    
          response.data
            .pipe(sharp()
              .jpeg({ quality: 70 })
              .resize({ width: 800 })
            )
            .pipe(dest);
    
          dest.on('finish', () => {
            resolve(true);
            console.log('Image downloaded and processed successfully');
          });
    
          dest.on('error', (err) => {
            console.error('Error downloading or processing the image:', err);
            reject(false);
          });
        } catch (err) {
          console.error('Error:', err);
          reject(false);
        }
      });
    }
    

    const sourceFolderPath = path.resolve('./app');
    const destinationFolderPath = path.resolve('./new_app');
    const fileId = el.S;
    const filename = await getRandomFileName();
    const folder = await copyFolderWithCustomName(sourceFolderPath, destinationFolderPath, el.B);

    if (folder) {
      const destinationPath = `./new_app/${folder}/media/images/${filename}`;
      const result = await downloadImage(fileId, destinationPath);

      var subcategory_id = 998;

      
      const price2 = el.T * 0.3 + el.T;
      const title = await replace(el.D);
      const page_title = `BQS-at-${title}-Gohoardings-Solution`;
      const thumb = `https://${folder}.odoads.com/media/${folder}/media/images/${filename}`;

      var lat,lng;

      if (el.Q === undefined) {
        lat = '0.000000',
        lng = '0.000000'
      } else {
        lat = el.Q,
        lng = el.R
      }


      const sql = `INSERT INTO goh_bqs_audit (id, vendors, media_owner_code, page_title, state, city, shelter_name, road_name, area, location, front_panel, side_panel, side_qty, back_drop, back_qty, bqs_qty, size, illumination, lat, lng, thumb, price, price_2, keyword, email, phone, contact_person) VALUES (${el.A}, '${el.B}', '${folder}', '${page_title}', '${el.C}', '${el.D}', '${el.E}', '${el.F}', '${el.G}', '${el.H}', '${el.I}', '${el.J}', '${el.K}','${el.L}','${el.M}','${el.N}','${el.O}','${el.P}', ${lat}, ${lng}, '${thumb}' ,${el.T}, ${price2},'${el.X}', '${el.U}','${el.V}','${el.W}')`;
      

      db.query(sql, (error, results) => {
        if (error) {
          console.log("error", error);
        } else {
          const insertId = results.insertId;
          const code = `GOH${subcategory_id}T${insertId}`;
          const updateSql = `UPDATE goh_bqs_audit SET code = '${code}' WHERE id = ${insertId}`;
          db.query(updateSql);
        }
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }

    count++;
  }
}

// insert media_owners into tblcompanies

app.get("/testing00011", cors(), async (req, res) => {
  db.changeUser({ database: 'gohoardi_goh' }, function (err) {
    if (err) {
      console.error('Error changing database:', err);
      throw err;
    }

    const selectSql = 'SELECT DISTINCT(media_owner_code) FROM `goh_mediaa2` WHERE 1';

    db.query(selectSql, (selectError, results) => {
      if (selectError) {
        console.error('Error executing SELECT query:', selectError);
        res.status(500).send('Internal Server Error');
        return;
      }
      const insertSql = 'INSERT INTO tblcompanies (media_owner_code) VALUES ?';

      const values = results.map(result => [result.media_owner_code]);

      db.query(insertSql, [values], (insertError) => {
        if (insertError) {
          console.error('Error executing INSERT query:', insertError);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.status(200).send('Data inserted successfully');
      });
    });
  });
});


// compress existing images

app.get("/testing00012", cors(), async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.changeUser({ database: 'gohoardi_goh' }, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const selectSql = 'SELECT media_owner_code FROM `tblcompanies` WHERE 1';

    const results = await new Promise((resolve, reject) => {
      db.query(selectSql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    for (const row of results) {
      const code = row.media_owner_code;
      const sourceFolderPath = path.resolve('./app');
      const imagesPath = path.resolve(`./new_app/${code}/media/images`);
      const destimagesPath = path.resolve(`./new_app2/${code}/media/images`);
      const destinationFolderPath = path.resolve('./new_app2');
    
      await copyFolderWithCustomName(sourceFolderPath, destinationFolderPath, code);
    
      const files = await fs.promises.readdir(imagesPath);
    
      for (const file of files) {
        const sourceFilePath = path.join(imagesPath, file);
        const destinationFilePath = path.join(destimagesPath, file);
    
        await sharp(sourceFilePath)
          .toFormat('jpeg')
          .jpeg({ quality: 70 })
          .resize({ width: 800 })
          .toFile(destinationFilePath);
      }
    }
    

    res.status(200).send('Images compressed and saved successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    db.end();
  }
});





/***********************************************************
                      Testing
***********************************************************/



app.get("/testing011", cors(), async (req, res) => {
  const filePath = './excel/media3.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const options = {
    header: 'A',
    range: 1,
  };

  const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);

  await ExcelExtractor2(ExcelJson, filePath);

  res.send("Excel update completed.");
});

async function downloadImage2() {
  return false;
}

async function ExcelExtractor2(ExcelJson, filePath) {
  const rowsToUpdate = [];

  for (const el of ExcelJson) {
    const result = await downloadImage2();

    if (result === false) {
      const columnAValue = el.A;
      rowsToUpdate.push(columnAValue);
    }
  }

  const workbook = XLSX.readFile(filePath);

  for (const rowNumber of rowsToUpdate) {
    const worksheet = workbook.Sheets['Sheet1'];
    const conditionColumn = 'O';
    const cellAddress = `${conditionColumn}${rowNumber}`;
    worksheet[cellAddress] = { v: 'Updated Value', t: 's' };
  }

  XLSX.writeFile(workbook, filePath);
}



















/***********************************************************
                      Android Testing
***********************************************************/

app.post("/android001", cors(), async (req, res) => {
  const {email} = req.body;
  db.changeUser({database : 'gohoardi_goh'}, function(err) {
    if (err) throw err;
  });
  db.query( "SELECT *  FROM aa_test WHERE a='" + email + "'",
    (error, results) => {
      if (error) {
        res.send({message : error})
      } else if (results.length > 0){
        res.send({message : "success", access_token : "data", username : "Uday"})
      } else {
        res.send({message : "not found"})
      }
    }
  );
});

app.post("/android002", cors(), async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  res.send({ message: "Logout successful" });
});

app.get("/android003", cors(), async (req, res) => {
  db.changeUser({database : 'odoads_tblcompanies'}, function(err) {
    if (err) throw err;
  });
  // db.query( "SELECT *  FROM tblcompanies LIMIT 10 OFFSET "+pages+"",
  db.query( "SELECT *  FROM tblcompanies LIMIT 5",
  (error, results) => {
    if (error) {
      res.send({message : "error"})
    } else if (results.length > 0){
      res.send({data : results})
    } else {
      res.send({message : "not found"})
    }
  }
);
});

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

// Set up multer upload instance with the storage configuration
const upload = multer({ storage });

// API endpoint for image and video upload
app.post('/android004', upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
  console.log(req.files);
  console.log(req.body);

  const { image, video } = req.files;
  const username = req.body.username;

  // Handle the uploaded image file
  if (image) {
    const imageFile = image[0];
    const { filename, mimetype, size } = imageFile;
    // Compress the image file
    await compressImage(imageFile.path);
    // Process the compressed image file as needed
    // ...

    console.log('Image uploaded:', filename);
  }

  // Handle the uploaded video file
  if (video) {
    const videoFile = video[0];
    const { filename, mimetype, size } = videoFile;
    // Compress the video file
    await compressVideo(videoFile.path);
    // Process the compressed video file as needed
    // ...

    console.log('Video uploaded:', filename);
  }

  // Return a response indicating the successful upload
  res.json({ message: 'Files uploaded successfully' });
});

// Function to compress an image using sharp
async function compressImage(filePath) {
  const compressedFilePath = filePath.replace(/(\.[\w\d_-]+)$/i, '-compressed$1');
  await sharp(filePath).jpeg({ quality: 80 }).toFile(compressedFilePath);
  return compressedFilePath;
}

// Function to compress a video using fluent-ffmpeg
async function compressVideo(filePath) {
  const compressedFilePath = filePath.replace(/(\.[\w\d_-]+)$/i, '-compressed$1');
  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions('-crf 28')
      .output(compressedFilePath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  return compressedFilePath;
}


/***********************************************************
                    Android Testing End
***********************************************************/

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

app.get('/oauth2callback', async (req, res) => {
  try {
    const code = req.query.code;

    const credentials = await import('./cred1.json');
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token = oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(token);

    // Save the token to a file for future use
    fs.writeFile('./token.json', JSON.stringify(token));

    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error during authentication:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// upload file to gdrive

app.get('/testing1231', async (req, res) => {

    const filePath = './output.pdf';
    const fileName = 'document.pdf';

    const serviceAccountKey = JSON.parse(readFileSync('./gdrive-serve.json'));
    
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
    
      const drive = google.drive({ version: 'v3', auth });
    
      const fileMetadata = {
        name: fileName,
        mimeType: 'application/pdf',
      };
    
      const media = {
        mimeType: 'application/pdf',
        body: createReadStream(filePath),
      };
    
      try {
        const response = drive.files.create({
          resource: fileMetadata,
          media,
          fields: 'id',
        });
        console.log(response.data);
        console.log(`PDF file uploaded with ID: ${response.data.id}`);
      } catch (error) {
        console.error('Error uploading PDF file:', error.message);
      }
});

// delete file from gdrive

app.get('/testing1232', async (req, res) => {

  const fileId = '1WCERDQDp6Yq7LUjJ0GfvTcAT2lFZwfW5';
  const serviceAccountKey = JSON.parse(readFileSync('./gdrive-serve.json'));

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    await drive.files.delete({
      fileId: fileId,
    });

    console.log(`File with ID ${fileId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
});

// list files from gdrive

app.get('/testing1233', async (req, res) => {
  const serviceAccountKey = JSON.parse(readFileSync('./gdrive-serve.json'));

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.list({
      fields: 'files(id, name)',
    });

    const files = response.data.files;

    if (files.length === 0) {
      console.log('No files found in the root directory.');
    } else {
      console.log('Files in the root directory:');
      files.forEach((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    }
  } catch (error) {
    console.error('Error listing files:', error.message);
  }
});

// delete file from gdrive

app.get('/testing1234', async (req, res) => {

  const fileId = '1zLq9soqnKFrZQQV0jStKnACpRs-ClE0a'
  const serviceAccountKey = JSON.parse(readFileSync('./gdrive-serve.json'));

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: 'bussduro@gmail.com',
      },
    });

    console.log(`File shared to bussduro`);
  } catch (error) {
    console.error('Error sharing file:', error.message);
  }
});

// transfer ownership not workinga as its need to login
app.get('/testing12309', async (req, res) => {

  const fileId = '1zLq9soqnKFrZQQV0jStKnACpRs-ClE0a'
  const serviceAccountKey = JSON.parse(readFileSync('./gdrive-serve.json'));

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {

    await drive.permissions.create({
      fileId: fileId,
      transferOwnership: true,
      requestBody: {
        role: 'owner',
        type: 'user',
        emailAddress: 'bussduro@gmail.com',
      },
    });

    console.log(`Ownership transferred to bussduro`);
  } catch (error) {
    console.error('Error transferring ownership:', error.message);
  }
});


/*******************                                                        */

app.get("/tester002", cors(), async (req, res) => {
  res.send("there")
})

app.get("/tester001", cors(), async (req, res) => {

  const filePath = './excel/Patna.xlsx';

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const options = {
    header: 'A',
    range: 1,
  };

  const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);

  ExcelExtract(ExcelJson);

})

async function checkIdExist(id) {
  return new Promise((resolve, reject) => {
    const checkSql = `SELECT id FROM goh_audited_sites WHERE id = ${id}`;
    db.query(checkSql, (error, results) => {
      if (error) {
        console.error('Error checking if ID exists:', error);
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

async function ExcelExtract(ExcelJson) {
  db.changeUser({ database: "gohoardi_goh" }, function(err) {
    if (err) throw err;
  });

  const maxRowsPerBatch = 10000;
  let count = 0;

  for (const el of ExcelJson) {
    try {
      // if (count === maxRowsPerBatch) {
      //   await new Promise((resolve) => setTimeout(resolve, 1 * 10 * 1000));
      //   count = 0;
      // }
      const idExists = await checkIdExist(el.A);
      if (idExists) {
        console.log(
          `Skipping row with ID ${el.A} as it already exists in the database.`
        );
        continue;
      }
      // const words = el.G.split(" ");
      // const firstTwoWords = words.slice(0, 2);
      // const hash = firstTwoWords.join("_");
      const random = Math.floor(Math.random() * 100) + 1;

      const sql = `INSERT INTO goh_audited_sites (id, state, city, location, subcategory, illumination, w, h, quantity, size, hashKey, vendors) VALUES (${el.A},'${el.B}','${el.C}','${el.D}','${el.E}','${el.F}','${el.G}','${el.H}','${el.I}',${el.J},'audited','patna')`

      // const sql = `INSERT INTO goh_bqs_audit (id, vendors, state, city, shelter_name, road_name, area, location, front_panel, side_panel, side_qty, back_drop, back_qty, bqs_qty, size, illumination, lat, lng, thumb, price, hashKey, price_2) 
      // VALUES (${el.A}, '${el.B}', '${el.C}', '${el.D}', '${el.E}', '${el.F}', '${el.G}', '${el.H}', '${el.I}', '${el.J}', '${el.K}','${el.L}','${el.M}','${el.N}','${el.O}','${el.P}', ${lat}, ${lng}, '${el.S}' ,${el.T}, '${hash}', ${price2})`
      
      db.query(sql, (error, results) => {
        if (error) {
          console.log("error", el.A ,  error);
        } else {
          // const insertQuery = `
          // INSERT INTO goh_campaign_vendor (name, vendors, users, userid, password, hashKey, Campaign_id)
          // SELECT '${el.C}', '${el.C}', 10, 'goh', 'qwerty', '${el.C}', 'camp_01'
          // FROM DUAL
          // WHERE NOT EXISTS (
          //   SELECT 1 FROM goh_campaign_vendor WHERE vendors = '${el.C}'
          // )`
          // db.query(insertQuery);
          console.log("success");
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }

    count++;
  }
}


/**                                                        ******************/



const googleMapsApiKey = 'AIzaSyDEKx_jLb_baUKyDgkXvzS_o-xlOkvLpeE';


async function generateGoogleMapsImage(lat, lng, width, height, marker) {
  const markerIcon = encodeURIComponent('https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png');
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=${width}x${height}&maptype=satellite&markers=icon:${markerIcon}|${lat},${lng}&key=${googleMapsApiKey}&scale=2&format=png&visual_refresh=true`;

  const mapImageBuffer = await axios.get(staticMapUrl, { responseType: 'arraybuffer' });
  return mapImageBuffer.data;
}

async function combineImages(originalImageBuffer, overlayImageBuffer, location, lat, lng, date, outputPath) {
  try {
    const originalImage = await sharp(originalImageBuffer);
    const overlayImage = await sharp(overlayImageBuffer);

    const { width, height } = await originalImage.metadata();
    const rw = Math.round(width / 5)
    const resizedOverlayImage = await overlayImage.resize(rw, rw).toBuffer();


    const response = await axios.get('https://gohoardings.com/images/web_pics/logo.png', { responseType: 'arraybuffer' });
    const logBuffer = Buffer.from(response.data, 'binary');
    const logoBuffer = await sharp(logBuffer)
    .resize(rw, null)
    .toBuffer();

    const overlayPosition = {
      left: 0,
      top: height - rw -20,
    };

    const blackOverlay = Buffer.from(`<svg><rect width="${width}" height="${rw}" fill="rgba(0, 0, 0, 0.5)"/></svg>`);

    const overlayTextSvg = `<svg height = '${rw}' width = '${width}'>
    <text x="30%" y="${Math.round(rw / 10)}" font-size="${Math.round(rw / 10)}" font-family="Arial" fill="white">${location}</text>
    <text x="30%" y="${Math.round(rw / 4)}" font-size="${Math.round(rw / 10)}" font-family="Arial" fill="white">H8VC+F8, E-82, E Block, Sector 6, Noida, Uttar Pradesh 201301, India</text>
    <text x="30%" y="${Math.round(rw / 2.5)}" font-size="${Math.round(rw / 10)}" font-family="Arial" fill="white">Lat ${lat}\u00B0</text>
    <text x="30%" y="${Math.round(rw / 1.8)}" font-size="${Math.round(rw / 10)}" font-family="Arial" fill="white">Long ${lng}\u00B0</text>
    <text x="30%" y="${Math.round(rw / 1.4)}" font-size="${Math.round(rw / 10)}" font-family="Arial" fill="white">${date} 10:46 AM GMT +5:30</text>
  </svg>`;


    const overlayTextBuffer = Buffer.from(overlayTextSvg);

    const finalImageBuffer = await originalImage
      .composite([
        { input: blackOverlay, left: 0, top: height - rw - 20},
        { input: resizedOverlayImage, left: overlayPosition.left, top: overlayPosition.top },
        { input: overlayTextBuffer, left: - Math.round(rw / 2.3), top: overlayPosition.top + Math.round(rw / 7.5) },
        { input: logoBuffer, left: width - rw, top: height - rw -20 },
      ])
      .toBuffer();

    return finalImageBuffer;
  } catch (error) {
    console.error('Error combining images:', error.message || error);
    throw error;
  }
}


app.get('/generateImage', async (req, res) => {
  try {
    const data = [
      { id: 1, location : 'Sear Goverdhan Dafi, Uttar Partdesh, India', img: 'http://80.209.238.62:3002/upload/image1.jpg', lat: 28.593680, lng: 77.320831, date: '20-01-2024' }
    ];

    const originalImageBuffer = await axios.get(data[0].img, { responseType: 'arraybuffer' });
    const googleMapsImageBuffer = await generateGoogleMapsImage(data[0].lat, data[0].lng, 150, 150, true);

    const finalImageBuffer = await combineImages(originalImageBuffer.data, googleMapsImageBuffer, data[0].location, data[0].lat,  data[0].lng  , data[0].date, 'output_image.jpg');

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(finalImageBuffer);
  } catch (error) {
    console.error('Error generating image:', error.message || error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/api/mediaOwners', async (req, res) => {
  try {
    // SELECT data from the table
    const selectResults = await query('SELECT DISTINCT(media_owner_code), mediaownercompanyname, mediaownername, email, phonenumber FROM `goh_mediaa2`');

    // INSERT selected data into tblcompanies
    for (const mediaOwner of selectResults) {
      let sql = `INSERT INTO tblcompanies SET name='${mediaOwner.mediaownercompanyname}',code='${mediaOwner.media_owner_code}',contact_firstname='${mediaOwner.mediaownername}',contact_email='${mediaOwner.email}',contact_phone='${mediaOwner.phonenumber}',contact_password = '$2a$08$TRfrKOqNtJyMoXkuyc90P.ubOzjPwpmwHR7gNaomDJEBTPhOPJ7DS',register='true',db_created='new',add_by='self'`;
      odquery(sql)
    }    

    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function query(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}


app.get('/time', async (req, res) => {
    const formattedDateTime = moment().subtract(2, 'days').tz('Asia/Kolkata');
	  let formattedString = formattedDateTime.format('DD/MM/YY hh:mm A [GMT] ZZ');
    formattedString = formattedString.replace(/([+-]\d{2})(\d{2})/, "$1:$2")
    res.send(formattedString);
})


function odquery(sql) {
  return new Promise((resolve, reject) => {
    od.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}




/*************************************************************************/

app.get("/bulkMailer", cors(), async (req, res) => {

  const filePath = './excel/vendor.csv';

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

    const Hello = `<h2>Dear, ${el.B}</h2>`

    const msg = `<p><strong>Company : ${el.A} <br> Email : ${el.C} <br> Password : qwerty</strong></p>`

    var htmlContent = fs.readFileSync(path.resolve( './mail.html'), 'utf8');
    htmlContent = htmlContent.replace('{{message}}', msg);
    htmlContent = htmlContent.replace('{{hello}}', Hello);

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

/*************************************************************************/


async function scrapeData(url, selector) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const scrapedData = $(selector).text().trim();

    return scrapedData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function extractDetails(data) {

  // Extract address
  const addressRegex = /Address\s*([^]+?)(?=\s*Email)/;
  const addressMatch = data.match(addressRegex);
  const address = addressMatch ? addressMatch[1].trim() : "N/A";

  // Extract email
  const emailRegex = /Email\s*([^\s]+@[^\s]+\.(?:com|in|COM|IN|Com|In))/;
  const emailMatch = data.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : "N/A";

  return {address, email };
}


app.get("/scrap", cors(), async (req, res) => {
  const filePath = './excel/comp.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const options = {
    header: 'A',
    range: 1,
  };

  const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);
  var count = 0;
  
  for (const el of ExcelJson) {
    const cmpnyUrl = el.C.replace(/ /g, "-");
    const targetUrl = `https://www.companydetails.in/company/${cmpnyUrl}`;
    const targetSelector = 'a, h6';

    try {
      const data = await scrapeData(targetUrl, targetSelector);
      
      if (data) {
        const { address, email } = extractDetails(data);
        const existingCINQuery = `SELECT * FROM cin_details WHERE cin = '${el.A}'`;
        
        const result = await new Promise((resolve, reject) => {
          db.query(existingCINQuery, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });

        if (result.length === 0) {
          const insertQuery = `INSERT INTO cin_details (cin, name, address, email) VALUES ('${el.A}', '${el.C}', '${address}', '${email}')`;
          
          await new Promise((resolve, reject) => {
            db.query(insertQuery, (err, result2) => {
              if (err) reject(err);
              count++;
              console.log("Success ", count);
              resolve();
            });
          });
        } else {
          console.log(`${el.A} CIN already exists.`);
        }
      } else {
        console.log('No data found for the provided selector.');
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
});



  app.listen(3333, () => {
    console.log("Yey, your server is running on port 3333");
  });