/**
 * Narzędzie do obsługi asynchronicznych funkcji middleware w Express
 * @module utils/asyncHandler
 */
// utils/asyncHandler.js

/**
 * Opakowuje asynchroniczną funkcję middleware, aby automatycznie obsługiwać błędy
 * i przekazywać je do mechanizmu obsługi błędów Express
 * 
 * @param {Function} fn - Asynchroniczna funkcja middleware do opakowania
 * @returns {Function} - Opakowana funkcja middleware z obsługą błędów
 * @example
 * // Użycie w routerze:
 * router.get('/resource', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
