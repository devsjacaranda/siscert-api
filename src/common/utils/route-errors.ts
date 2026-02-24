import { ParseError } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

/******************************************************************************
                                 Classes
******************************************************************************/

/**
 * Error with status code and message.
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    // HttpStatusCodes is ValueOf<typeof HttpStatusCodes> (number union); eslint conflates with Error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.status = status;
  }
}

/**
 * Handle "parseObj" errors.
 */
export class ValidationError extends RouteError {
  public static MESSAGE =
    'The parseObj() function discovered one or ' + 'more errors.';

  public constructor(errors: ParseError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg);
  }
}
