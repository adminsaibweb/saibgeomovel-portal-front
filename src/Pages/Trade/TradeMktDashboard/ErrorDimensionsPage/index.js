import React, { Component } from 'react';
import { Button, Icon } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import { Container, DivDetalhe, Linha } from './styled';
import { Link } from 'react-router-dom';
export default class ErrorDimensionsPage extends Component {
  render() {
    return (
      <>
        <Container>
          <DirectTituloJanela
            classNameTitulo="professionalScheduleTitle"
            // style={{ marginLeft: '64px!important' }}
            urlVoltar={'/home'}
            // state={item}
            stateUrl={undefined}
            forceBack={false}
            titulo={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>warning</Icon>Erro
              </span>
            }
          />
          <div className="contentError">
            <h4>
              <Icon large>image_not_supported</Icon>
              <p>
                Esta pagina não pôde ser exibida devido ao tamanho da tela de
                seu dispositivo, requisitos minimos para exibição é de
                1280x720px
              </p>
            </h4>
            <Linha>
              <DivDetalhe>
                <Link to="/home">
                  <Button className="saib-button is-primary">Voltar</Button>
                </Link>
              </DivDetalhe>
            </Linha>
          </div>
        </Container>
      </>
    );
  }
}
