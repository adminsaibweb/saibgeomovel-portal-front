import React, { useState } from 'react';
import { Button, Modal } from 'react-materialize';
import { alerta, updateScheduleData } from '../../../../../services/funcoes';
import { getAllSyncs, getDataSync } from '../../tradeGlobalFunctions';
import WaitScreen from '../../../../../Components/Globals/WaitScreen';
import { Div } from './styled';
import { useHistory } from 'react-router-dom';

export function LastSync({ dateCustom, empresaAtiva, usuarioAtivo }) {
  const [loading, setLoading] = useState(false);

  const router = useHistory();

  async function handleGetAllData() {
    try {
      setLoading(true);
      if (dateCustom) {
        const res = await getAllSyncs(empresaAtiva, usuarioAtivo, dateCustom);

        const lastItem = res[res.length - 1];

        if (lastItem) {
          handleGetDataCloud(lastItem);
        } else {
          alerta('Não foi possível atualizar os dados');
        }
      } else {
        alerta('Não foi possível atualizar os dados');
      }
    } catch (error) {
      alerta('Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetDataCloud(dataSelected) {
    try {
      setLoading(true);
      let res = await getDataSync(dataSelected._id);

      if (res) {
        const dataRes = res.find((e) => e._id === dataSelected._id);

        if (dataRes.DB) {
          await updateScheduleData(dataRes.DB)
          alerta('Os dados do app foram atualizados, faça o login novamente', 1);
          router.push('/expired');
        } else {
          alerta('Não foi possível atualizar os dados');
        }
      } else {
        alerta('Não foi possível atualizar os dados');
      }
    } catch (error) {
      alerta('Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <WaitScreen loading={loading} />
      <Modal
        className="modal-item-activity"
        actions={[
          <Button
            modal="close"
            style={{ marginRight: '5px' }}
            node="button"
            waves="green"
            className="waves-effect waves-light saib-button is-primary saib2"
            onClick={async () => await handleGetAllData()}
          >
            Continuar
          </Button>,
          <Button
            modal="close"
            node="button"
            href="#modal1"
            waves="green"
            className="waves-effect waves-light saib-button is-primary"
          >
            Cancelar
          </Button>,
        ]}
        bottomSheet={false}
        fixedFooter={false}
        header="ATENÇÃO!"
        id="modal1"
        open={!!dateCustom}
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
        <Div>
          <span style={{ fontWeight: '700', textAlign: 'center', fontSize: '1.4rem' }}>
            Esta ação irá sobrescrever todos os dados de pesquisa do seu aplicativo. Isto é irreversível
          </span>
          <span style={{ fontWeight: '500', textAlign: 'center', fontSize: '1.3rem' }}>Deseja continuar?</span>
        </Div>
      </Modal>
    </>
  );
}
