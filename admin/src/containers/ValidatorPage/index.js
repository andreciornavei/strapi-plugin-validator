import React, { memo, useEffect, useState } from 'react';
import pluginId from '../../pluginId';

import {
  PluginHeader,
  request
} from 'strapi-helper-plugin';

import Table from "./../../components/Table"


const ValidatorPage = ({ match }) => {

  const [validator, setValidator] = useState()

  const fetchValidator = async () => {
    const response = await request(`/${pluginId}/validators/${match.params.validator}`)
    setValidator(response)
  }

  useEffect(() => {
    fetchValidator()
  }, [])

  return (
    <div className="container-fluid">
      <PluginHeader
        title="Validator"
        description={`${match.params.validator || "Make great validations easy."}`}
        actions={[
          {
            label: "Cancelar",
            secondary: true,
            disabled: true,
            onClick: () => { }
          },
          {
            label: "Salvar",
            primary: true,
            disabled: true,
            onClick: () => { }
          },
        ]}
      />

      <Table.TableContainer>
        <Table.TableHeader>
          <h2>6 routes</h2>
        </Table.TableHeader>
        <Table.TableBody>
          <table>
            <tbody>
              <tr>
                <td>First Column</td>
                <td>Middle Column</td>
                <td>Last Column</td>
              </tr>
              <tr>
                <td>First Column</td>
                <td>Middle Column</td>
                <td>Last Column</td>
              </tr>
              <tr>
                <td>First Column</td>
                <td>Middle Column</td>
                <td>Last Column</td>
              </tr>
            </tbody>
          </table>
        </Table.TableBody>
        <Table.TableAction>
          <i className="fa fa-plus" /> ADD ANOTHER ROUTE
        </Table.TableAction>
      </Table.TableContainer>

    </div>
  );
};

export default memo(ValidatorPage);
