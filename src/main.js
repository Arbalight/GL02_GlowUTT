const cli = require("@caporal/core").default;

cli
    .argument("<name>", "Name to say Hello")
    .action(({logger, args}) => {
        logger.info("Hello %s !", args.name);
    })

cli.run();
