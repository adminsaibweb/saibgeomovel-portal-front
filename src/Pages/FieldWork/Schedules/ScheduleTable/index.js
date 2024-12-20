import React from 'react';
import { Td } from './styled'

class AppointmentsTable extends React.Component {
  selectRow = (id) => {
    const { onRowSelect } = this.props;
    onRowSelect(id);
  };

  selectAllRows = () => {
    const { onAllRowsSelect, data } = this.props;
    onAllRowsSelect(data);
  };

  render() {
    const { data, selectedRows, selectAll } = this.props;

    return (
      <table
        style={{
          margin: '30px 0px',
          width: '90%',
          borderRadius: '4px',
          border: '1px solid #cccccc'
        }}
      >
        <thead>
          <tr>
            <Td
              onClick={this.selectAllRows}
              style={{ backgroundColor: '#f2f2f2', padding: '10px' }}
            >
              <input
                type="checkbox"
                checked={selectAll || selectedRows.length === data.length}
                style={{
                  cursor: 'pointer',
                  position: 'unset',
                  opacity: '1',
                  transform: 'scale(1.5)',
                  filter: 'grayscale(59%) hue-rotate(63deg)',
                  marginLeft: '10px',
                }}
              />
            </Td>
            <th style={{ backgroundColor: '#f2f2f2', padding: '10px' }}>Nome</th>
            <th style={{ backgroundColor: '#f2f2f2', padding: '10px' }}>Data</th>
            <th style={{ backgroundColor: '#f2f2f2', padding: '10px' }}>QTd. Clientes</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((row) => (
            <tr
              key={row.GAA_ID}
              className={selectedRows.includes(row.GAA_ID) ? 'selected' : ''}
              onClick={() => this.selectRow(row.GAA_ID)}
              style={{
                backgroundColor: selectedRows.includes(row.GAA_ID) ? '#ebdff0' : '#ffffff',
                height: '40px',
                transition: 'background-color 0.3s',
              }}
            >
              <Td>
                <input
                  name={row.GAA_ID}
                  type="checkbox"
                  checked={selectedRows.includes(row.GAA_ID)}
                  id={row.GAA_ID}
                  style={{
                    cursor: 'pointer',
                    position: 'unset',
                    opacity: '1',
                    transform: 'scale(1.5)',
                    filter: 'grayscale(59%) hue-rotate(63deg)',
                    marginLeft: '10px',
                  }}
                />
              </Td>
              <Td>{row.USR_NOME}</Td>
              <Td>{row.GAA_DTA_AGENDA}</Td>
              <Td>{row.QTDE_CLIENTES}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default AppointmentsTable;
