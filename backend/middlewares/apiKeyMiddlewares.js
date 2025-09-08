export const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['app_api_key']; 
  const validApiKey = process.env.app_api_key; 

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
};