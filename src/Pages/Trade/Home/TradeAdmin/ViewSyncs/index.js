import React, { useState } from 'react';
import { ContentSyncs, LineSyncs } from './styled';
import { Button, Modal } from 'react-materialize';
import { alerta, updateScheduleData } from '../../../../../services/funcoes';
import { getDataSync } from '../../tradeGlobalFunctions';
import WaitScreen from '../../../../../Components/Globals/WaitScreen';
import { Labels, Linha } from '../../style';
import api from '../../../../../services/api';
import { useHistory } from 'react-router-dom';

export function ViewSyncs({ data, date }) {
  const [dataSelected, setDataSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const router = useHistory();

  function nameOperation(status) {
    const res = {
      sync: 'Sincronizado',
      start: 'Dia iniciado',
    };

    return res[status];
  }

  async function verifyCodeAuth() {
    try {
      const res = await api.post('v1/pwd/validate', {
        pwd: code,
      });

      const { sucess } = res.data;

      if (sucess) {
        await handleGetDataCloud();
        return null;
      }
      alerta('Não foi possivel realizar a autenticação, verifique se o código está correto', 2);
    } catch (error) {
      alerta('Não foi possivel realizar a autenticação', 2);
    }
  }

  async function handleGetDataCloud() {
    try {
      setLoading(true);
      let res = await getDataSync(dataSelected._id);

      if (res) {
        const dataRes = res.find((e) => e._id === dataSelected._id);
        if (dataRes.DB) {
          await updateScheduleData(dataRes.DB)
          alerta('Os dados do app foram atualizados', 1);
          router.push('/expired');
        } else {
          alerta('Não foi possível atualizar os dados');
        }
      } else {
        alerta('Não foi possível atualizar os dados');
      }

      setDataSelected(null);
    } catch (error) {
      alerta('Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <WaitScreen loading={loading} />
      {!data && (
        <span>
          Não existem dados sincronizados no dia <strong>{date}</strong> até o momento
        </span>
      )}
      {data && (
        <>
          <ContentSyncs>
            {data.map((item) => (
              <LineSyncs key={item._id}>
                <span>
                  {item.DATA} - {item.HORA}
                </span>
                <span style={{ color: '#000' }}>{nameOperation(item.STATUS)}</span>
                <button onClick={() => setDataSelected(item)} className="saib-button is-primary">
                  Obter dados
                </button>
              </LineSyncs>
            ))}
          </ContentSyncs>
        </>
      )}

      <Modal
        className="modal-item-activity"
        actions={[
          <Button
            modal="close"
            style={{ marginRight: '5px' }}
            node="button"
            waves="green"
            className="waves-effect waves-light saib-button is-primary saib2"
            onClick={async () => await verifyCodeAuth()}
          >
            Confirmar
          </Button>,
          <Button
            modal="close"
            node="button"
            href="#modal1"
            waves="green"
            className="waves-effect waves-light saib-button is-primary"
            onClick={() => setDataSelected(null)}
          >
            Cancelar
          </Button>,
        ]}
        bottomSheet={false}
        fixedFooter={false}
        header="Substituir dados atuais"
        id="modal1"
        open={!!dataSelected}
        options={{
          dismissible: true,
          endingTop: '10%',
          inDuration: 250,
          onCloseStart: null,
          onOpenEnd: null,
          onOpenStart: null,
          opacity: 0.5,
          outDuration: 250,
          preventScrolling: true,
          startingTop: '4%',
        }}
        root={document.body}
      >
        <span style={{ marginTop: '20px' }}>
          Insira abaixo o código para obter os dados que estão no servidor, composto por 6 numeros, um código só pode
          ser utilizado <strong>UMA</strong> vez. <br />
          <strong style={{ marginTop: '1rem' }}>Para prosseguir realize a autenticação</strong>
        </span>
        <Linha>
          <Labels fontWeight={200}>Codigo de autenticação</Labels>
          <input
            type="text"
            name="code"
            autoComplete="off"
            className="campoTexto"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Linha>
      </Modal>
    </>
  );
}
