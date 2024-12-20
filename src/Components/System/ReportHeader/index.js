import React, { Component } from 'react';
import { getFromStorage } from '../../../services/auth';
import { getCurrentDate, getCurrentTime } from '../../../services/funcoes';

export default class ReportHeader extends Component {
  state = {};
  async componentDidMount() {
    this.carregarVariaveisEstado();
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = await getFromStorage();
    if (sessao !== undefined) {
      this.setState({
        empresaNomeFantasia: sessao.empresaNomeFantasia,
        codigoEmpresa: sessao.codigoEmpresa,
      });
    }
  };

  render() {
    const { empresaNomeFantasia, codigoEmpresa } = this.state;
    return (
      <>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '90%',
            textAlign: 'center',
          }}
        >
          <h5>{this.props.title !== undefined ? this.props.title : ''}</h5>
        </div>
        {this.props.filter !== undefined ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              width: '100%',
              marginBottom: '10px',
              backgroundColor: '#f1f1f1',
              fontWeight: '500',
              padding: '0px 2px',
              fontSize: '0.8rem',
              borderBottom: '1px solid #ccc',
            }}
          >
            {this.props.filter.map((item) => (
              <>
                {item.objectName !== undefined &&
                  item.objectValue !== undefined && (
                    <>
                      <div
                        key={Math.floor(Math.random() * 10000)}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          padding: '2px',
                          margin: '2px 5px',
                        }}
                      >
                        <span
                          style={{
                            marginRight: '5px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {item.objectName +
                            ' : ' +
                            item.objectValue.toLowerCase()}
                        </span>
                      </div>
                    </>
                  )}
              </>
            ))}
          </div>
        ) : (
          <></>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            borderBottom: '1px solid #ccc',
            marginBottom: '10px',
            backgroundColor: '#f1f1f1',
            fontWeight: '500',
            padding: '0px 2px',
          }}
        >
          <span style={{ width: '100%' }}>
            {empresaNomeFantasia !== undefined
              ? codigoEmpresa + ' - ' + empresaNomeFantasia
              : ''}
          </span>
          <span style={{ marginRight: '10px' }}>{getCurrentDate()}</span>
          <span>{getCurrentTime()}</span>
        </div>
      </>
    );
  }
}
