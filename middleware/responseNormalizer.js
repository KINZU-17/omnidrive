/**
 * Normalize API response format across all endpoints
 */
function normalizeResponse(req, res, next) {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
        // Ensure response follows standard format
        if (data && typeof data === 'object') {
            const normalized = {
                success: data.success !== undefined ? data.success : (!data.error && res.statusCode < 400),
                data: data.data || (data.error ? undefined : data),
                error: data.error || null,
                timestamp: new Date().toISOString(),
            };
            
            // Remove null error field
            if (normalized.error === null) {
                delete normalized.error;
            }
            
            return originalJson(normalized);
        }
        
        return originalJson(data);
    };
    
    next();
}

module.exports = normalizeResponse;
