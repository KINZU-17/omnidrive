module.exports = function(api) {
    api.cache(true);
    
    // Use minimal config for Node.js/Jest (backend tests)
    // Keep Expo preset for frontend only
    const isNodeEnv = process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test';
    
    return {
        presets: isNodeEnv ? [] : ['babel-preset-expo'],
    };
};
