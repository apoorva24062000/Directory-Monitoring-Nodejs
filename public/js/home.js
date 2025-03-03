

// script.js
const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  fetchrecords();
  getFileCounts();

  setupPagination([], recordsPerPage);



  

  
});




socket.on("fileMoved", function (data) {
  // Handle the file moved data received from the server
  console.log("File moved:", data);

  fetchrecords();
});

socket.on("unsupportedFile", function (data) {
  // Handle the file moved data received from the server
  console.log("File moved:", data);

  fetchrecords();
});



socket.on("RecycleMoved", function (data) {
  // Handle the file moved data received from the server
  console.log("File moved:", data);

  fetchrecords();
});
function fetchDataEverySecond() {
  getFileCounts();
}

setInterval(fetchDataEverySecond, 1000);


// function sortTable(columnIndex) {
//   var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
//   table = document.getElementById("data-table");
//   switching = true;
//   dir = "asc";

//   while (switching) {
//     switching = false;
//     rows = table.rows;

//     for (i = 1; i < rows.length - 1; i++) {
//       shouldSwitch = false;

//       x = rows[i].getElementsByTagName("td")[columnIndex];
//       y = rows[i + 1].getElementsByTagName("td")[columnIndex];

//       var xValue = x.innerHTML.toLowerCase();
//       var yValue = y.innerHTML.toLowerCase();

//       if (dir === "asc" && xValue > yValue) {
//         shouldSwitch = true;
//         break;
//       } else if (dir === "desc" && xValue < yValue) {
//         shouldSwitch = true;
//         break;
//       }
//     }

//     if (shouldSwitch) {
//       rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
//       switching = true;
//       switchcount++;
//     } else {
//       if (switchcount === 0 && dir === "asc") {
//         dir = "desc";
//         switching = true;
//       }
//     }
//   }
// }


var sortDirection = [];
function sortTable(columnIndex, columnName) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;

  table = document.getElementById("data-table");
  switching = true;
  dir = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc'; // Toggle sorting direction
  sortDirection[columnIndex] = dir; // Update sorting direction for the column

  // Reset arrow styles for all columns
  for (var arrow of document.querySelectorAll('.sort-arrow')) {
    arrow.innerHTML = '&#9660;&#9650;'; // Reset to both arrows
  }

  // Change arrow style for the clicked column and sorting direction
  document.getElementById(`${columnName}-sort-arrow`).innerHTML = dir === 'asc' ? '&#9650;' : '&#9660;';

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[columnIndex];
      y = rows[i + 1].getElementsByTagName("td")[columnIndex];

      var xValue = x.innerHTML.toLowerCase();
      var yValue = y.innerHTML.toLowerCase();

      if ((dir === "asc" && xValue > yValue) || (dir === "desc" && xValue < yValue)) {
        shouldSwitch = true;
        break;
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    }
  }
}
document
  .getElementById("data-table")
  .addEventListener("click", async function (event) {
    const target = event.target;
    if (target.tagName === "TD") {
      const folder =
        target.parentElement.querySelector("td:nth-child(2)").textContent;
      const filename =
        target.parentElement.querySelector("td:nth-child(1)").textContent;
      if (folder === "doc") {
        // Open the modal for DOC files
        openConvertModal(filename);
      } else if (folder === "images") {
        // Redirect to content page for other file types
        openImageModal(folder, filename);
      } else if (folder === "pdf") {
        // Redirect to content page for other file types
        redirectToContentPageForCompressPdf(folder, filename);
      } 
      else if(folder === "excel"){
        openExcelConvertModal(filename)
      }
      else if(folder === "csv"){
        openCsvModal(filename);

      }
      else {
        redirectToContentPage(folder, filename);
      }
    }
  });

let FILE_IMAGE;
let FOLDER_IMAGE;
function openImageModal(folder, filename) {
  // Display the modal for DOC files
  const convertModal = new bootstrap.Modal(
    document.getElementById("imageModal"),
    {
      keyboard: true,
    }
  );

  FILE_IMAGE = filename;
  FOLDER_IMAGE = folder;
  // Set the filename in the modal content
  document.getElementById(
    "convertModalLabel"
  ).textContent = `Convert ${filename} to PDF`;

  // Open the modal
  convertModal.show();
}

async function resizeImage() {
  try {
    const height = document.getElementById("inputHeight").value;
    const width = document.getElementById("inputWidth").value;
    if (!isValidNumber(height) || !isValidNumber(width)) {
      $("#resizeImageModal").modal("hide");
      showToast("Please enter valid numbers for height and width.", "error");
      return;
    }
    const maxAllowedValue = 10000;

    if (height > maxAllowedValue || width > maxAllowedValue) {
      $("#resizeImageModal").modal("hide");
      showToast(
        "Height or width is too large. Please enter values below " +
          maxAllowedValue +
          ".",
        "error"
      );
      return;
    }

    const response = await axios.post(`/user/resizeImage/${FILE_IMAGE}`, {
      height: height,
      width: width,
    });

    // Handle the response from the server
    if (response.status === 200) {
      console.log(response.data.message);
      console.log(response.data.resizedImagePath);
      showToast("Image resized and saved successfully !!", "success");
      // Clear input fields
      document.getElementById("inputHeight").value = "";
      document.getElementById("inputWidth").value = "";
    } else {
      console.error("Error resizing image:", response.data.error);
      // You may want to handle the error scenario here, e.g., show an error message
    }

    // Close the resize modal
    $("#resizeImageModal").modal("hide");
  } catch (error) {
    console.error("Error resizing image:", error.message);
    showToast("Error resizing image !!", "error");
    // You may want to handle the error scenario here, e.g., show an error message
  }
  FILE_IMAGE = null;
  FOLDER_IMAGE = null;
}

function isValidNumber(value) {
  return /^[0-9]+$/.test(value);
}

async function redirectToContentPageForCompress() {
  if (FOLDER_IMAGE === "images" || FOLDER_IMAGE === "pdf") {
    try {
      await compressAndDownloadFile(FOLDER_IMAGE, FILE_IMAGE);
      showToast("File compressed and downloaded successfully !!", "success");
      $("#imageModal").modal("hide");
      // await openExtractedFile(content, folder);
    } catch (error) {
      console.error(
        `Error compressing and downloading ${FILE_IMAGE} file:`,
        error.message
      );
    }
    FILE_IMAGE = null;
    FOLDER_IMAGE = null;
  }
}

let FILE_DOC;
function openConvertModal(filename) {
  // Display the modal for DOC files
  const convertModal = new bootstrap.Modal(
    document.getElementById("convertModal"),
    {
      keyboard: true,
    }
  );

  FILE_DOC = filename;
  // Set the filename in the modal content
  document.getElementById(
    "convertModalLabel"
  ).textContent = `Convert ${filename} to PDF`;

  // Open the modal
  convertModal.show();
}

async function convertDocToPDF() {
  try {
    const response = await fetch(
      `http://localhost:9050/user/doctopdf/${FILE_DOC}`
    );
    if (!response.ok) {
      console.error("Error converting DOC to PDF:", response.statusText);
      // Handle error, e.g., show an error message
      showToast("Error converting DOC to PDF", "error");
      return;
    }

    const result = await response.json();
    console.log(result);

    // Handle success, e.g., show a success message
    showToast("File converted and saved successfully", "success");

    // Close the modal after conversion or handle it based on your actual logic
    $("#convertModal").modal("hide");
  } catch (error) {
    console.error("Error converting DOC to PDF:", error);
    // Handle error, e.g., show an error message
    showToast("Error converting DOC to PDF", "error");
  }
  FILE = null;
}


let FILE_EXCEL ;
function openExcelConvertModal(filename){
  const ExcelconvertModal = new bootstrap.Modal(
    document.getElementById("ExcelModal"),
    {
      keyboard: true,
    }
  );

  FILE_EXCEL = filename;
  // Set the filename in the modal content
  document.getElementById(
    "convertModalLabel"
  ).textContent = `Convert ${filename} to PDF`;

  // Open the modal
  ExcelconvertModal.show();
}



async function convertExcelToPDF() {
  try {
    const response = await fetch(
      `http://localhost:9050/user/exceltopdf/${FILE_EXCEL}`
    );
    if (!response.ok) {
      console.error("Error converting Excel to PDF:", response.statusText);
      // Handle error, e.g., show an error message
      showToast("Error converting Excel to PDF", "error");
      return;
    }

    const result = await response.json();
    console.log(result);

    // Handle success, e.g., show a success message
    showToast("File converted and saved successfully", "success");

    // Close the modal after conversion or handle it based on your actual logic
    $("#ExcelModal").modal("hide");
  } catch (error) {
    console.error("Error converting Excel to PDF:", error);
    // Handle error, e.g., show an error message
    showToast("Error converting Excel to PDF", "error");
  }
  FILE = null;
}

let csvfile;

function openCsvModal(filename) {
  // Display the CSV modal
  const csvModal = new bootstrap.Modal(document.getElementById("csvModal"), {
    keyboard: true,
  });
  csvfile = filename

  // Set the filename in the modal content (optional)
  document.getElementById("csvModalLabel").textContent = `CSV Actions - ${csvfile}`;

  // Open the CSV modal
  csvModal.show();

  // Attach event listeners for CSV modal buttons
  document.getElementById("displayCsvButton").onclick = function () {
    // Call a function to display CSV content
    redirectToContentPage("csv", csvfile);
    $("#csvModal").modal("hide");

  

  };

  document.getElementById("convertCsvToPdfButton").addEventListener("click", function () {
    // Call a function to convert CSV to PDF
    convertCsvToPdf(csvfile);
  });
 
}



async function convertCsvToPdf(csvfile) {
  try {
    const response = await fetch(
      `http://localhost:9050/user/csvtopdf/${csvfile}`
    );
    if (!response.ok) {
      console.error("Error converting CSV to PDF:", response.statusText);
      // Handle error, e.g., show an error message
      showToast("Error converting CSV to PDF", "error");
      return;
    }

    const result = await response.json();
    console.log(result);

    // Handle success, e.g., show a success message
    showToast("File converted and saved successfully", "success");

    // Close the modal after conversion or handle it based on your actual logic
    $("#csvModal").modal("hide");
  } catch (error) {
    console.error("Error converting CSV to PDF:", error.message);
    // Handle error, e.g., show an error message
    showToast("Error converting CSV to PDF", "error");
  }
  FILE = null;
}

function showToast(message, type) {
  const toaster = document.getElementById("toaster");
  const toasterMessage = document.getElementById("toasterMessage");

  toasterMessage.textContent = message;
  toaster.style.backgroundColor =
    type === "success" ? "rgba(0, 135, 68, 1)" : "rgba(217, 43, 43, 1)";
  toaster.style.display = "block";

  setTimeout(() => {
    closeToaster();
  }, 5000); // Close the toaster after 5 seconds
}

function closeToaster() {
  const toaster = document.getElementById("toaster");
  toaster.style.display = "none";
}

async function redirectToContentPageForCompressPdf(folder, filename) {
  if (folder === "pdf") {
    try {
      await compressAndDownloadFile(folder, filename);
      showToast("File compressed and downloaded successfully !!", "success");

      // await openExtractedFile(content, folder);
    } catch (error) {
      console.error(
        `Error compressing and downloading ${folder} file:`,
        error.message
      );
    }
  }
}

// Function to make a GET request to the getFileCounts API
async function getFileCounts() {
  try {
    const response = await fetch("http://localhost:9050/user/getcount"); // Update the endpoint accordingly
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const counts = await response.json();
    // console.log(counts.counts.csvCount);

    // Display file counts in the placeholders
    document.getElementById("imageCount").textContent =
      counts.counts.imagesCountLast3Days;
    document.getElementById("jsonCount").textContent =
      counts.counts.jsonCountLast3Days;
    document.getElementById("csvCount").textContent =
      counts.counts.csvCountLast3Days;
    document.getElementById("pdfCount").textContent =
      counts.counts.pdfCountLast3Days;
    document.getElementById("docCount").textContent =
      counts.counts.docCountLast3days;
    document.getElementById("excelCount").textContent =
      counts.counts.excelCountLast3days;
    console.log(counts.counts.docCountLast3Days);
    console.log(document.getElementById("docCount").textContent);

    // Emit a Socket.IO event to update the counts in real-time
    socket.emit("folderCounts", counts);
    console.log(counts, "aaaaaaa");
    // updateFileCounts(counts);
  } catch (error) {
    console.error("Error fetching file counts:", error.message);
    // Handle errors, e.g., display an error message to the user
  }
}

function fetchrecords() {
  axios
    .get("http://localhost:9050/user/getfilename")
    .then((response) => {
      console.log("Response from server:", response);

      const fileData = response.data.names;
      console.log("File data received:", fileData);

      if (fileData && fileData.mainFiles) {
        const allFiles = [
          ...fileData.mainFiles,
          ...fileData.imagesFiles,
          ...fileData.jsonFiles,
          ...fileData.csvFiles,
          ...fileData.pdfFiles,
          ...fileData.docFiles,
          ...fileData.excelFiles,
        ];

        // Display the first page initially
        populateTableBody(allFiles, 1, recordsPerPage);
        // Set up pagination
        setupPagination(allFiles, recordsPerPage);


      } else {
        console.error("Invalid or incomplete response data");
      }
    })
    .catch((error) => {
      console.error("Error in Fetching Data:", error);
    });
}

var recordsPerPage = 4;

function populateTableBody(data, pageNumber, recordsPerPage) {
  var tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // Clear existing table content

  var startIndex = (pageNumber - 1) * recordsPerPage;
  var endIndex = startIndex + recordsPerPage;

  var currentPageData = data.slice(startIndex, endIndex);

  currentPageData.forEach(function (file) {
    var row = tableBody.insertRow();

    var filenameCell = row.insertCell(0);
    filenameCell.textContent = file.filename;

    var folderCell = row.insertCell(1);
    folderCell.textContent = file.folder;

    var extensionCell = row.insertCell(2);
    extensionCell.textContent = file.extension;

    var dateCell = row.insertCell(3);
    dateCell.textContent = file.creationDate;

    var iconCell = row.insertCell(4);
    iconCell.innerHTML = getIconForFileType(file.extension);

    var deleteCell = row.insertCell(5);
    // deleteCell.innerHTML = `<button class="btn btn-danger" onclick="deleteRow(${file.filename})">Delete</button>`;
    deleteCell.innerHTML = `<button class="btn btn-danger" onclick="confirmDelete('${file.filename}')">Delete</button>`;
  });
}

function confirmDelete(filename) {
  // Set the filename in the modal content (optional)
  document.getElementById(
    "deleteConfirmationModalLabel"
  ).textContent = `Delete Confirmation - ${filename}`;

  // Show the modal
  $("#deleteConfirmationModal").modal("show");

  // Set up the event listener for the "Delete" button in the modal
  document.getElementById("confirmDeleteBtn").onclick = function () {
    console.log("modallll", filename);

    // Call the deleteRow function when the user confirms deletion
    deleteRow(filename);

    // Close the modal
    $("#deleteConfirmationModal").modal("hide");
  };
}

// Add this function in your script.js

async function deleteRow(filename) {
  try {
    console.log(filename);
    const response = await axios.post(
      `http://localhost:9050/user/moveToRecycleBin/${filename}`
    );
    console.log(response, "9999999999999999999999");
    if (response.status === 200) {
      // Assuming showSuccessMessage is a function to display success messages
      showToast("File Deleted Successfully","success");
      filename = null;
      // Refresh the table after deletion
      fetchrecords();
    } else {
      console.error("Error deleting Row", response.data);
      // Handle the error scenario
    }
  } catch (error) {
    console.error("Error deleting Row", error);
    // Handle error display or logging
  }
}

function getIconForFileType(extension) {
  switch (extension.toLowerCase()) {
    case "pdf":
      return '<i class="material-icons">picture_as_pdf</i>';
    case "docx":
      return '<i class="material-icons">description</i>';
    case "json":
      return '<i class="material-icons">code</i>';
    case "xlsx":
      return '<i class="material-icons">table_chart</i>';
    case "jpg":
    case "jpeg":
    case "png":
      return '<i class="material-icons">image</i>';
    case "csv":
      return '<i class="material-icons">table_rows</i>';
      case "pptx":
        return '<i class="material-icons">slideshow</i>'; 
    default:
      return ""; // Empty string if no matching file type
  }
}
function setupPagination(data, recordsPerPage) {
  var paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear existing pagination

  var pageCount = Math.ceil(data.length / recordsPerPage);

  for (var i = 1; i <= pageCount; i++) {
    var li = document.createElement("li");
    li.classList.add("page-item");

    var a = document.createElement("a");
    a.classList.add("page-link");
    a.href = "#";
    a.textContent = i;

    a.addEventListener("click", function (event) {
      event.preventDefault();
      var pageNumber = parseInt(event.target.textContent);
      populateTableBody(data, pageNumber, recordsPerPage);
    });

    li.appendChild(a);
    paginationContainer.appendChild(li);
  }
}

// ... (your existing code) ...

// // Function to filter the table based on extension and search input
// function filterTable() {
//   const oneFilters = document.getElementById("filters1");
//   const twoFilters = document.getElementById("filters2");
//   var extensionFilter = document.getElementById("extensionFilter").value;
//   var searchInput = document.getElementById("searchInput").value.toLowerCase();
//   var tableRows = document.querySelectorAll("#data-table tbody tr");

//   if (searchInput != "") {
//     twoFilters.style.display = "block";
//     oneFilters.style.display = "none";
//   } else {
//     twoFilters.style.display = "none";
//     oneFilters.style.display = "block";
//   }

//   tableRows.forEach(function (row) {
//     var extensionCell = row
//       .querySelector("td:nth-child(3)")
//       .textContent.toLowerCase();
//     var filenameCell = row
//       .querySelector("td:nth-child(1)")
//       .textContent.toLowerCase();

//     // Check if the row matches the selected extension and search input
//     var extensionMatch =
//       extensionFilter === "all" || extensionCell.includes(extensionFilter);
//     var searchMatch = filenameCell.includes(searchInput);

//     // Toggle the row's visibility based on the filter conditions
//     row.style.display = extensionMatch && searchMatch ? "" : "none";
//   });
// }






// Function to filter the table based on extension and search input
function filterTable() {
  const oneFilters = document.getElementById("filters1");
  const twoFilters = document.getElementById("filters2");
  var extensionFilter = document.getElementById("extensionFilter").value;
  var alphanumericFilter = document.getElementById("alphanumericFilter").value;
  var searchInput = document.getElementById("searchInput").value.toLowerCase();
  var tableRows = document.querySelectorAll("#data-table tbody tr");
 
  if (searchInput != "") {
    twoFilters.style.display = "block";
    oneFilters.style.display = "none";
  } else {
    twoFilters.style.display = "none";
    oneFilters.style.display = "block";
  }
 
  tableRows.forEach(function (row) {
    var extensionCell = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();
    var filenameCell = row
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase();
 
    // Check if the row matches the selected extension and search input
    var extensionMatch =
      extensionFilter === "all" || extensionCell.includes(extensionFilter);
    var alphanumericMatch =
      alphanumericFilter === "all" || checkAlphanumericRange(filenameCell, alphanumericFilter);
 
    // Toggle the row's visibility based on the filter conditions
    row.style.display = extensionMatch && alphanumericMatch && filenameCell.includes(searchInput) ? "" : "none";
  });
}
 
// Function to check if the filename starts with the specified alphanumeric range
function checkAlphanumericRange(filename, range) {
  var firstChar = filename.charAt(0).toUpperCase();
  switch (range) {
    case "0-9":
      return /[0-9]/.test(firstChar);
    case "A-H":
      return /[A-H]/.test(firstChar);
    case "I-U":
      return /[I-U]/.test(firstChar);
    case "V-Z":
      return /[V-Z]/.test(firstChar);
    default:
      return false;
  }
}
// Function to display content in a new tab
function redirectToContentPage(folder, filename) {
  if (folder === "json" || folder === "csv") {
    const contentPageUrl = `user/findFilePath/${filename}`;

    const newTab = window.open(contentPageUrl, "_blank");

    if (newTab) {
      newTab.addEventListener("load", async () => {
        const response = await fetch(contentPageUrl);
        const content = await response.json(); // Parse the response as JSON
        displayContent(content, folder, newTab.document);
      });
    } else {
      console.error("Unable to open a new tab.");
    }
  }
}

// Function to display content in a table
function displayContent(content, format, targetDocument) {
  const data = parseContent(content, format);
  if (data === null) {
    console.error("Error parsing content.");
    return;
  }
  if (format.toLowerCase() === "json") {
    const pre = targetDocument.createElement("pre");
    pre.textContent = JSON.stringify(data, null, 2); // Indentation of 2 spaces
    targetDocument.body.appendChild(pre);
    return;
  }
  // Create HTML table
  const table = targetDocument.createElement("table");
  table.classList.add("custom-data-table"); // Change the class name to 'custom-data-table'
  table.style.borderCollapse = "collapse"; // Add border-collapse style

  // Create table header
  const thead = targetDocument.createElement("thead");
  const headerRow = targetDocument.createElement("tr");

  Object.keys(data[0]).forEach((column) => {
    const th = targetDocument.createElement("th");
    th.textContent = column;
    th.style.border = "1px solid #dddddd"; // Add border style
    th.style.padding = "8px"; // Add padding
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Add title for CSV data above regular headers
  if (format.toLowerCase() === "csv") {
    const titleRow = targetDocument.createElement("tr");
    const titleCell = targetDocument.createElement("td");
    titleCell.colSpan = Object.keys(data[0]).length; // Span the title across all columns
    titleCell.textContent = "CSV Data";
    titleCell.style.textAlign = "center";
    titleCell.style.fontWeight = "bold";
    titleCell.style.backgroundColor = "#f2f2f2"; // Add background color
    titleCell.style.border = "1px solid #dddddd"; // Add border style
    titleCell.style.padding = "8px"; // Add padding
    titleRow.appendChild(titleCell);
    thead.insertBefore(titleRow, thead.firstChild); // Insert title as the first row in the thead
  }

  // Create table body
  const tbody = targetDocument.createElement("tbody");
  data.forEach((rowData) => {
    const row = targetDocument.createElement("tr");
    Object.values(rowData).forEach((column) => {
      const td = targetDocument.createElement("td");
      td.textContent = column;
      td.style.border = "1px solid #dddddd"; // Add border style
      td.style.padding = "8px"; // Add padding
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  // Append the table to the document or replace an existing table
  const existingTable = targetDocument.querySelector(".custom-data-table"); // Change the class name to 'custom-data-table'
  if (existingTable) {
    existingTable.replaceWith(table);
  } else {
    // Replace the entire document body with the table
    targetDocument.body.innerHTML = "";
    targetDocument.body.appendChild(table);
  }
}
function parseContent(content, format) {
  switch (format.toLowerCase()) {
    case "csv":
      return parseCSVContent(content.contentLines);
    case "json":
      try {
        const jsonString = content.contentLines.join("\n"); // Join the array into a single string
        const parsedObject = JSON.parse(jsonString);
        console.log(parsedObject);

        // Exclude contentLines property from the parsed object
        // delete parsedObject.contentLines;

        return parsedObject; // Return the parsed object without contentLines
      } catch (error) {
        console.error("Error parsing JSON. Content:", content.contentLines);
        console.error("Error message:", error.message);
        return null; // Return null to indicate an error
      }
    default:
      console.error("Unsupported file format:", format);
      return [];
  }
}

// Function to parse CSV content
function parseCSVContent(content) {
  if (!Array.isArray(content)) {
    console.error("CSV content is not an array:", content);
    return [];
  }

  // Join the array elements into a single string
  const csvString = content.join("\n");

  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {});
  });
}

async function compressAndDownloadFile(folder, filename) {
  //COMPRESS AND DOWNLOAD API
  try {
    // Make an AJAX request to compress and download the file
    const response = await fetch(`user/compressfile/${filename}`);

    if (response.ok) {
      const contentType = response.headers.get("Content-Type");
      const contentDisposition = response.headers.get("Content-Disposition");
      const isZipFile =
        contentType === "application/zip" ||
        contentDisposition.includes("attachment");

      if (isZipFile) {
        // Create a link and trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(await response.blob());
        link.download = `${filename}.zip`; // Use .zip extension for the ZIP file
        link.click();
        // showToast('File compressed and downloaded successfully !!', 'success');
      } else {
        console.error(`Error: Unexpected content type or content disposition.`);
      }
    } else {
      console.error(
        `Error compressing and downloading ${folder} file:`,
        response.statusText
      );
    }
  } catch (error) {
    console.error(
      `Error compressing and downloading ${folder} file:`,
      error.message
    );
    throw error; // Rethrow the error to be caught by the calling function if needed
  }
}

const userName = sessionStorage.getItem("usernameinfo");
console.log(userName);
const userNameLink = document.getElementById("userloggedIn");
//   console.log(userNameLink);
//   const name=document.getElementById('Welcome_user')
if (userName) {
  userNameLink.innerHTML = `${userName}`;
} else {
  // If the name is not available, you can handle it accordingly
  userNameLink.textContent = "User";
}

// document.getElementById(
//   "Welcome_user"
// ).textContent = `Welcome Back, ${userName}`;

document
  .getElementById("logoutLink")
  .addEventListener("click", function (event) {
    event.preventDefault();

    // Show a SweetAlert confirmation dialog
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear user-related information from sessionStorage
        window.sessionStorage.removeItem("usernameinfo");

        // Redirect to the logout page or perform any other necessary actions
        window.location.href = "/";
      }
    });
  });
