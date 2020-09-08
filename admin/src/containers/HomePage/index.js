import React, { memo, useEffect, useState } from 'react';
import { Switch, Route, Link } from "react-router-dom"
import { NotFound } from 'strapi-helper-plugin';
import pluginId from '../../pluginId';

import {
  ContainerFluid,
  LeftMenu,
  request
} from 'strapi-helper-plugin';

import ValidatorPage from "../ValidatorPage"


const HomePage = ({match}) => {

  const [validators, setValidators] = useState([])

  const fetchValidators = async () => {
    const response = await request(`/${pluginId}/validators`)
    setValidators(response)
  }

  useEffect(() => {
    fetchValidators()
  }, [])

  return (
    <div className="container-fluid">
      <div className="row">
        <LeftMenu className="col-sm-3">
          <ul>
            {validators && validators.map(validator => {
              return <li key={validator.path}>
                <Link to={`${match.url}/${validator.path}`}>
                  {validator.path}
                </Link>
              </li>
            })}
          </ul>
        </LeftMenu>
        <ContainerFluid className="col-sm-9">
          <Switch>
            <Route path={`${match.url}/:validator`} component={ValidatorPage} />
          </Switch>
        </ContainerFluid>
      </div>
    </div>
  );
};

export default memo(HomePage);
