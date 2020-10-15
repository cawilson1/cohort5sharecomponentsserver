const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

function authorizeUser(request, response, next) {
  console.log('auth user hit');
  if (request.body.token == null) {
    console.log('token is undefined');
    return response.status(401).send();
  }
  const jwk = {
    keys: [
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'EON4nyDwdljF9haNE4PHaQ2tcSCIZ2ny7PpgRryQeUs=',
        kty: 'RSA',
        n:
          'kpO26AmThAorL6F4qS15K78JEQLHvpmGgwVvXwiaE871QogK9_YzRkDIMtxMiNxUWU_h0DVgRHh4YxzA8J5rrXPHX7_LtHpHUP1jHvlxJUNmUKs8KqFyYDiv4Hy50k67sa2jhQ4AxK-w6HPPBqRf18SZybABhprVpW19eKl-_hrXk6Ds9dU4TkH8P5S4Vn6y8MmfJABpO8eM_N6N8ZwW0YXt1tswG35UP5kGh5BTBTS0sY7LzLmbKKgtNkKCeBeuVdiU5R9O5ccPiZxnaqxNiLsVjzZz6pFdtAJ6bKlmr3ZQKwzSViKQUbyx2XMIVHYfus9QskTF394hNiWpwjdJrQ',
        use: 'sig',
      },
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'GyqoTu8EwT3cFvyExhotPodgQ5c92Wt/Few+0JzAwGs=',
        kty: 'RSA',
        n:
          'md03yBEUtfTBMqPP0g8LxRl6cK9UQXNX3Fx4ge_L5WoUAHQ3ZaIpyJZQh78Tk2WMoisGlLKl-RBTovvN4DZzcHUg9Nr4NuROVG8JIr4OKOUKJ6T290Trzg_VDk3rtd2YMgIfEQFUCBwBx6KgSgmK4kMo0dohsNOjawd-MHjyFBL4nDmdYkazQRUb9PsAYUP_PV_HavtB9CaKnh01PCHMCZk1RcHy1crIllwFJA6NN3rTdchzIDqixQoS4YAXH_prey9ZA66w2uvNvYLMvuB0kdYk__DSIFHx2NkMDakDlBhVZKwJLFzNXdSj0OQd8mEOIP7YqhsGzp13Zj3uetFn-Q',
        use: 'sig',
      },
    ],
  };
  const jwkForIdToken = jwk.keys[0];
  const pem = jwkToPem(jwkForIdToken);
  try {
    jwt.verify(request.body.token, pem, (error, decodedToken) => {
      if (error) {
        console.log(error);
        return response.status(403).send(error);
      }
      console.log('decoded token', decodedToken);
      request.decodedToken = decodedToken;
      next();
    });
  } catch (error) {
    return response.status(500).send(error);
  }
}

module.exports = authorizeUser;
