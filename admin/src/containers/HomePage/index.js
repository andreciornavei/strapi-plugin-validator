/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import {
  PluginHeader,
  ContainerFluid,
  request
} from 'strapi-helper-plugin';



const HomePage = () => {

  const fetchValidators = async () => {
    const response = await request(`/${pluginId}/validators`)
    console.log(response)
  }

  useEffect(() => {
    fetchValidators()
  }, [])

  return (
    <ContainerFluid >
      <PluginHeader
        title="Validator"
        description="Make great validations easy."
        actions={[
          {
            label: "Atualizar",
            primary: true,
            onClick: () => { fetchValidators() }
          },
        ]}
      />
    </ContainerFluid>
  );
};

export default memo(HomePage);
