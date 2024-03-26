import OpenAI from "openai";
import ExcelJS from 'exceljs';

const openai = new OpenAI(
    {apiKey: ''} //your API key
);

async function askChatGPT(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{role: "system", content: message }],
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`Error during API request: ${error.message}`);
    throw error;
  }
}

// Return 1 if DevTool; return 0 if not
const taskDescription = "In the following message, I will provide you with a description of a company. Your task is to evaluate whether this company is involved in the development, production, or offering of a development tool (devtool). For clarity, by devtool, I refer to any software, platform, or technology utilized by developers or that automates the work of developers. This includes, but is not limited to, software infrastructure, AI/ML technologies, Large Language Models (LLM), development operations (devops), and development security operations (devsecops). The key criterion is whether the product or service aids in coding, building, hosting, testing, or any other aspect of software development. Please assess the provided information and determine if the described company fits the criteria of offering a devtool. If it does, return 1, if not, return 0."

async function classifyCompaniesAsDevTools(filePath, sheetName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(sheetName);
  const numberOfRows = worksheet.rowCount;
  
  for (let i = 2; i <= numberOfRows; i++) {
    const row = worksheet.getRow(i);
    const companyDescription = row.getCell("O").value;

    const isDevTool = await askChatGPT(taskDescription + "Company description: " + companyDescription)

    const cell = row.getCell("S"); //change depending on where the description column is

    if (isDevTool == 0 || isDevTool == 1) {
      cell.value = Number(isDevTool);
    } else {
      cell.value = 'error'
    }

    if (i % 10 == 0) {
      console.log("Current row number:" + i);
    }

    if (i % 100 == 0) {
      console.log("saving...")
      await workbook.xlsx.writeFile(filePath);
    }
  }

  await workbook.xlsx.writeFile(filePath);
  console.log("Process finished")
}

//first argument: file path; second argument: sheet name
classifyCompaniesAsDevTools('funding-rounds-all.xlsx', 'funding-rounds-all'); 
