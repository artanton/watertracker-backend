export const setUpdateSettings = function (next) {
    this.options.new = true;
    this.options.runValidators = true;
    next();
  };
  
  