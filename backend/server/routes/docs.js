import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './../swagger.json' with { type: 'json' };

const router = express.Router();

router.use('', swaggerUi.serve);
router.get(
  '',
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customJsStr: `document.getElementsByTagName('html')[0].classList.add('dark-mode');`,
  }),
);

export default router;
