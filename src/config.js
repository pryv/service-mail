// Encapsulates values that are obtained from the configuration (file/...) using
// a convict configuration for this project. 
// Example: 
// 
//   var settings = Settings.load(); 
//   var value = settings.get('logs.console.active');
//   value.bool() //=> true (or a type error)
// 

class ExistingValue {
  
  constructor(name, value) {
    this.name = name; 
    this.value = value; 
  }
  
  // Returns the configuration value as a boolean. 
  // 
  bool() {
    const value = this.value; 
    if (typeof value === 'boolean') {
      return value; 
    }
    
    throw this._typeError('boolean');
  }
  
  /** 
   * Returns the configuration value as a string. 
   */
  str() {
    const value = this.value; 
    if (typeof value === 'string') {
      return value; 
    }
    
    throw this._typeError('string');
  }
  
  /** 
   * Returns the configuration value as a number. 
   */
  num() {
    const value = this.value; 
    if (typeof value === 'number') {
      return value; 
    }
    
    throw this._typeError('number');
  }
  
  /** 
   * Returns the configuration value as an unspecified object. 
   */
  obj() {
    const value = this.value; 
    
    // NOTE Flow doesn't want values to be null, that's why the second check is
    // also needed. (typeof null === 'object'...)
    if (typeof value === 'object' && value != null) {
      return value; 
    }
    
    throw this._typeError('object');
  }

  /** 
   * Returns the configuration value as an unspecified object. 
   */
  fun() {
    const value = this.value;  
    
    if (typeof value === 'function') {
      return value; 
    }
    
    throw this._typeError('function');
  }
  
  // Returns true if the value exists, meaning that it is not null or undefined.
  // 
  exists() {
    const value = this.value;  

    return value != null; 
  }
  
  // Returns true if the value is either null, undefined or the empty string. 
  // 
  blank() {
    const value = this.value;  

    return !this.exists() || value === ''; 
  }
  
  _typeError(typeName) {
    const name = this.name; 
        
    return new Error(
      `Configuration value type mismatch: ${name} should be of type ${typeName}, but isn't. `+
      `(typeof returns '${typeof this.value}')`); 
  }
}

class MissingValue {
    
  constructor(key) {
    this.message = `Configuration for '${key}' missing.`;
  }
  
  error() {
    return new Error(this.message);
  }
  
  bool() {
    throw this.error(); 
  }
  str() {
    throw this.error(); 
  }
  num() {
    throw this.error(); 
  }
  obj() {
    throw this.error(); 
  }
  fun() {
    throw this.error(); 
  }
  
  exists() {
    return false; 
  }
  blank() {
    return true; 
  }
}

module.exports = {
  ExistingValue, MissingValue
};