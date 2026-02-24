import jetEnv, { num, str } from 'jet-env';
import { isInArray } from 'jet-validators';

/******************************************************************************
                                 Constants
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

/******************************************************************************
                                 Setup
******************************************************************************/

const EnvVars = jetEnv({
  NodeEnv: isInArray([NodeEnvs.DEV, NodeEnvs.TEST, NodeEnvs.PRODUCTION]),
  Port: num,
  JwtSecret: str,
});

/******************************************************************************
                            Export default
******************************************************************************/

export default EnvVars;
