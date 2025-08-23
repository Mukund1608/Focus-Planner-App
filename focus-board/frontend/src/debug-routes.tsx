import { Routes } from 'react-router-dom';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import * as ReactRouter from 'react-router-dom';
import { PreBuiltUIList } from './config';

const DebugRoutes = () => {
  return (
    <Routes>
      {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}
    </Routes>
  );
};

export default DebugRoutes;
