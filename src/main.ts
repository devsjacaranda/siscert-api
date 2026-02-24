import logger from 'jet-logger';

import EnvVars from './common/constants/env';
import server from './server';
import { startPushVencimentosJob } from './jobs/push-vencimentos.job';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
server.listen(EnvVars.Port, (err) => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MESSAGE);
    /* eslint-disable no-process-env */
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      startPushVencimentosJob();
    } else {
      logger.warn('Push não iniciado: VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY não definidas');
    }
    /* eslint-enable no-process-env */
  }
});
