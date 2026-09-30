module.exports = (request, options) => {
    if (request.endsWith(".js")) {
      const tsRequest = request.replace(/\.js$/, ".ts");
  
      try {
        return options.defaultResolver(
          tsRequest,
          options
        );
      } catch {
        // Use the original JavaScript module.
      }
    }
  
    return options.defaultResolver(
      request,
      options
    );
  };