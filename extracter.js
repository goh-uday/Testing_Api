import express from 'express';
const app = express();
import mysql from 'mysql';
import cors from 'cors';
import XLSX from 'xlsx';
import path from 'path'
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';

let https;
try {
  https = require('node:https');
} catch (err) {
  console.log('https support is disabled!');
}

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    multipleStatements: true,
    user: "root",
    host: "localhost",
    password: "",
    database: "gohoardi_goh",
  });

  app.get("/", cors(), (req, res) => {
      res.send("Hello")
  });


/**************************************************** */

app.get("/testing002", cors(), async (req, res) => {

  const filePath = './excel/media.xlsx';

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const options = {
    header: 'A',
    range: 1,
  };

  const ExcelJson = XLSX.utils.sheet_to_json(worksheet, options);

  ExcelUpdator(ExcelJson);

})


async function ExcelUpdator(ExcelJson) {

  db.changeUser({ database: 'gohoardi_goh' }, function (err) {
    if (err) throw err;
  });


  for (const el of ExcelJson) {
    try {
      const sql = `UPDATE goh_mediaa2 SET saleasbunch = ${el.K}, state = '${el.C}' WHERE width = ${el.I} AND height = ${el.J} AND location = '${el.E}' AND price = ${el.P}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log("error", error);
        } else {
          console.log("success");
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}


app.get("/testing001", cors(), async (req, res) => {

  const filePath = './excel/media.xlsx';

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

async function removeSingleQuotes(inputString) {
  if (typeof inputString !== 'string') {
    throw new Error('Input must be a string');
  }

  return inputString.replace(/'/g, '');
}


async function updateExcel(filePath, rowsToUpdate) {
  const workbook = XLSX.readFile(filePath);

  for (const row of rowsToUpdate) {
    const worksheet = workbook.Sheets['Sheet1'];
    const conditionColumn = 'U';
    const cellAddress = `${conditionColumn}${row.columnAValue}`;
    worksheet[cellAddress] = { v: row.valueToUpdate, t: 's' };
  }

  XLSX.writeFile(workbook, filePath);
}

async function checkIdExists(id) {
  return new Promise((resolve, reject) => {
    const checkSql = `SELECT id FROM goh_mediaa2 WHERE id = ${id}`;
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

  const maxRowsPerBatch = 1000;
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

    const filePath = './excel/media.xlsx';

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
          console.error('Error:', "err");
          reject(false);
        }
      });
    }
    

    const sourceFolderPath = path.resolve('./app');
    const destinationFolderPath = path.resolve('./new_app');
    const fileId = el.Q;
    const filename = await getRandomFileName();
    const folder = await copyFolderWithCustomName(sourceFolderPath, destinationFolderPath, el.B);

    if (folder) {
      const destinationPath = `./new_app/${folder}/media/images/${filename}`;
      const result = await downloadImage(fileId, destinationPath);
      const rowsToUpdate = [];
      const columnAValue = el.A;

      if (result === true) {
        rowsToUpdate.push({ columnAValue, valueToUpdate: 'true' });
      } else if (result === false) {
        rowsToUpdate.push({ columnAValue, valueToUpdate: 'false' });
      }

      await updateExcel(filePath, rowsToUpdate);

      var subcategory_id;
      switch (el.H) {
        case "Billboard":
          subcategory_id = 112;
          break;
        case "Hoarding":
          subcategory_id = 112;
          break;
        case "Police Booth":
          subcategory_id = 172;
          break;
        case "Gentry":
          subcategory_id = 124;
          break;
        case "Unipole":
          subcategory_id = 173;
          break;
        case "Bridge Panel":
          subcategory_id = 113;
          break;
        case "FOB":
          subcategory_id = 122;
          break;
        case "Cantilever":
          subcategory_id = 117;
          break;
        case "FSU":
          subcategory_id = 174;
          break;
        case "Utility":
          subcategory_id = 175;
          break;
        case "Minipole":
          subcategory_id = 176;
          break;
        default:
          subcategory_id = 999;
          break;
      }

      
      
      const price2 = el.P * 0.3 + el.P;
      const title = await replace(el.E);
      const page_title = `${el.H}-at-${title}-Gohoardings-Solution`;
      const thumb = `https://${folder}.odoads.com/media/${folder}/media/images/${filename}`;
      const loc = await removeSingleQuotes(el.E);

      var status,lat,lng;

      if (result === true) {
        status = 1;
      } else {
        status = 0;
      }

      if (el.N === undefined) {
        lat = '0.000000',
        lng = '0.000000'
      } else {
        lat = el.N,
        lng = el.O
      }

      const sql = "INSERT INTO goh_mediaa2 (id,status,media_owner_code,thumbnail,thumb,main_media_id,client_id,category_id,category_name,subcategory_id,subcategory,medianame,saleasbunch,totalno,price_2,price,state,city,city_name,width,height,illumination,latitude,longitude,page_title,mediaownercompanyname,area,location,mediaownername,email,phonenumber,keyword,ftf) VALUES ("+el.A+",'"+status+"', '"+folder+"', '"+thumb+"', '"+thumb+"', 0, 0, 20, 'traditional-ooh-media', '"+subcategory_id+"', '"+el.H+"', '"+loc+"', '"+el.K+"', 1, '"+price2+"', '"+el.P+"', 0, 0, '"+el.D+"', '"+el.I+"', '"+el.J+"', '"+el.M+"', '"+lat+"', '"+lng+"', '"+page_title+"', '"+el.B+"', '"+el.L+"', '"+loc+"', '"+el.T+"', '"+el.R+"', '"+el.S+"', '"+el.G+"', '"+el.F+"')";
      

      db.query(sql, (error, results) => {
        if (error) {
          console.log("error", error);
        } else {
          const insertId = results.insertId;
          const code = `GOH${subcategory_id}T${insertId}`;
          const updateSql = `UPDATE goh_mediaa2 SET code = '${code}' WHERE id = ${insertId}`;
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

  app.listen(3333, () => {
    console.log("Yey, your server is running on port 3333");
  });