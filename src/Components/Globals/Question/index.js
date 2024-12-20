import React from 'react';
import { Modal, Button } from 'react-materialize';
// eslint-disable-next-line
import M from 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import './style.css';

const Question = React.forwardRef(function Question(props, ref) {
  const handleNo = () => {
    props.onNo();
  };

  const handleYes = () => {
    props.onYes();
  };

  const trigger = (
    <Button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px'
      }}
      className={props.classeBotaoPadrao}
    >
      {props.iconeBotaoPadrao} {props.textoBotaoPadrao !== '' && ` ${props.textoBotaoPadrao}`}
    </Button>
  );

  return (
    <div
      style={{
        width: props.larguraDiv ? props.larguraDiv : '100%'
      }}
    >
      <Modal
        className="modalQuestion"
        actions={[
          <>
            <Button className={props.classeBotaoSim} onClick={handleYes} color="primary">
              {props.tituloBotaoSim}
            </Button>
            {
              !props.singleButton && <Button className={props.classeBotaoNao} onClick={handleNo} color="primary">
                {props.tituloBotaoNao}
              </Button>
            }
          </>,
        ]}
        bottomSheet={false}
        fixedFooter={true}
        header={props.titulo}
        options={{
          dismissible: true,
          endingTop: '10%',
          inDuration: 0,
          onCloseEnd: null,
          onCloseStart: null,
          onOpenEnd: null,
          onOpenStart: props.aoMostrar ? props.aoMostrar : null,
          opacity: 0.5,
          outDuration: 0,
          preventScrolling: true,
          startingTop: '4%',
        }}
        trigger={trigger}
        open={props.isOpen}
      >
        <div
          style={{
            overflowY: props.overflowBodyModal ? props.overflowBodyModal : 'unset',
            overflowX: 'hidden',
            height: props.overflowBodyModal ? 'inherit' : 'unset',
          }}
        >
          {props.message}
        </div>
      </Modal>
    </div>
  );
});

export default Question;
