import inquirer from "inquirer";

const main = async () => {
  const inputs = await inquirer.prompt([
    {
      name: "username",
      type: "input",
      message: "What's your name?",
      default: "stranger",
      validate: input => typeof input === "string",
    },
  ]);

  console.log(`Hello, ${inputs.username}!`);
};

main();
