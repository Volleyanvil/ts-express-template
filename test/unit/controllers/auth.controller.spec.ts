// TODO
// https://stackoverflow.com/questions/61834610/how-to-write-a-unit-test-an-express-controller-using-jest
// Mock res, req, next
// Mock any called functions/class methods

// Methods to mock:
// - Mocking mongoose methods is not practical or included in testing scope.
// - Should instead create unique user to be used during test run or leave controller test to E2E testing

/**
 *  Register:
 * - Bad request: Invalid password. Mock method calls, check mockNext has been called
 * - Bad request: User create throws. Mock or not. Check mockNext calls
 * - Positive case: mock all method calls. Check res contents.
 */

/**
 * Login:
 * - Bad request: No username, email, password. Check next calls.
 * - Bad request: No user. Mock User method. Check next calls.
 * - Bad request: Invalid pwd. Mock user find to return mocked user with mocked method. Check next calls.
 * - Positive case: Mock all method calls. Check res contents
 */

/**
 * Logout:
 * - Bad request: No cookie. Chekc next calls.
 * - Bad request: No token. Mock Token method. Check next calls.
 * - Bad request: No user. Mock user method. Check next calls.
 * - Positive case: Mock all method calls. Check res contents.
 */

/**
 * Refresh:
 * - Bad req: No cookie. Mock req, Check next calls
 * - Bad req: No token. Mock calls. Check next.
 * - Bad req: No user. Mock calls. Check next.
 * - Positive: Mock all. check res contents.
 */

/**
 * Active logins:
 * - Positive: Mock req, methods. Check res.
 */

/**
 * Revoke:
 * - Bad reqs: Empty body, No logins, User is not owner
 * - Positive: Mock all. Check res.
 */

/**
 * Revoke All:
 * - Positive: Mock all. Check service mock calls, res contents.
 */

/**
 * verifyEmail:
 * - Not implemented or fully planned yet. No tests.
 */

/**
 * Revoke All:
 * - Not implemented or fully planned yet. No tests.
 */