import xl from 'excel4node';

const jsonToExcel = async ({ data, sheetName, outputPath }) => new Promise((resolve, reject) => {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet(sheetName);

  const headingColumnNames = Object.keys(data[0]);

  // Write Column Title in Excel file
  let headingColumnIndex = 1;
  headingColumnNames.forEach((heading) => {
    ws.cell(1, headingColumnIndex)
      .string(heading);
    headingColumnIndex += 1;
  });
  // Write Data in Excel file
  let rowIndex = 2;
  data.forEach((record) => {
    let columnIndex = 1;
    Object.keys(record).forEach((columnName) => {
      ws.cell(rowIndex, columnIndex)
        .string(record[columnName]?.toString() ?? '');
      columnIndex += 1;
    });
    rowIndex += 1;
  });
  wb.write(outputPath, (err) => {
    if (err) reject(err);
    resolve();
  });
});

export default jsonToExcel;
