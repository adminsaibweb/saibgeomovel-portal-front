import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';

import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import { Container } from './styled';
import { Checkbox, Chip, Icon } from 'react-materialize';
import M from 'materialize-css';
import Calendar from '../../../../Components/Globals/Calendar';
import {
  ContentBodyCollapsible,
  DataFilter,
  DivDetalhe,
  Labels,
  Linha,
  RowFilter,
} from '../VariableCalcularion/styled';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { alerta, formatDateTimeToBr, haveData } from '../../../../services/funcoes';
import { compareAsc, format } from 'date-fns';
import { SiGooglesheets } from 'react-icons/si';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from './ComponentToPrint';
import * as XLSX from 'xlsx';

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const KmDrivenReport = () => {
  const [dateInitial, setDateInitial] = useState(new Date());
  const [dateFinal, setDateFinal] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [dataCompany, setDataCompany] = useState({});
  const [idsPromoters, setIdsPromoters] = useState([]);
  const [idsSupervisors, setIdsSupervisors] = useState([]);
  const [promotoresChip, setPromotoresChip] = useState([]);
  const [supervisorsChip, setSupervisorsChip] = useState([]);
  const [selecionadosSup, setSelecionadosSup] = useState([]);
  const [selecionadosPromo, setSelecionadosPromo] = useState([]);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [dataReport, setDataReport] = useState(null);
  const [dataReportPDF, setDataReportPDF] = useState(null);
  const [imagesEnable, setImagesEnable] = useState(false);

  const componentImpressaoRef = useRef(null);

  async function carregarVariaveisEstado() {
    const sessao = await getFromStorage();

    const data = {
      codigoEmpresa: sessao.codigoEmpresa,
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      nomeUsuario: sessao.nomeUsuario,
      empresaNomeFantasia: sessao.empresaNomeFantasia,
      gupFlagAgenda: sessao.gupFlagAgenda,
    };

    setDataCompany(data);

    await handleLoadAllFilters(data);
  }

  async function handleLoadAllFilters(data) {
    const url = `v1/tradereport/allfilter/${data.empresaAtiva}/${data.usuarioAtivo}`;
    try {
      setLoading(true);
      const res = await api.get(url);
      const { data, sucess } = res.data;

      if (sucess) {
        let promotoresAux = data.promotores;
        promotoresAux =
          data.gupFlagAgenda === 1
            ? promotoresAux.filter((prom) => prom.PROMOTOR_ID === data.usuarioAtivo)
            : promotoresAux;
        let supervisoresAux = data.supervisores;

        let promotoresChips = {};
        for (const promotor of promotoresAux) {
          let item = promotor.PROMOTOR;
          promotoresChips[item] = null;
        }
        let supervisoresChips = {};
        for (const supervisor of supervisoresAux) {
          let item = supervisor.SUPERVISOR;
          supervisoresChips[item] = null;
        }

        setPromotoresChip(promotoresChips);
        setSupervisorsChip(supervisoresChips);
      } else {
        alerta('Erro ao carregar os filtros');
      }
    } catch (errors) {
      alerta(`Erro ao carregar os filtros => ${String(errors)}`);
    } finally {
      setLoading(false);
    }
  }

  async function onChangeSelectPromoter() {
    if (document.getElementById('promotoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('promotoresChips'));
      let promotoresSelecionados;
      let idsPromotersAux = [];

      if (dados !== undefined) {
        promotoresSelecionados = dados.chipsData;
        if (promotoresSelecionados && promotoresSelecionados?.length > 0) {
          for (let promotor of promotoresSelecionados) {
            let idPromotor = promotor.tag.split('-')[0].replace(' ', '');
            idsPromotersAux.push(idPromotor);
          }
        }
        setIdsPromoters(idsPromotersAux);
        setSelecionadosPromo(promotoresSelecionados);
      }
    }
  }

  async function onChangeSelectSupervisor() {
    if (document.getElementById('supervisoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('supervisoresChips'));
      let supervisoresSelecionados;
      let idsSupervisors = [];

      if (dados !== undefined) {
        supervisoresSelecionados = dados.chipsData;
        if (supervisoresSelecionados && supervisoresSelecionados?.length > 0) {
          for (let supervisor of supervisoresSelecionados) {
            let idSupervisor = supervisor.tag.split('-')[0].replace(' ', '');
            idsSupervisors.push(idSupervisor);
          }
        }
        setSelecionadosSup(supervisoresSelecionados);
        setIdsSupervisors(idsSupervisors);
      }
    }
  }

  async function handleCreateReport() {
    try {
      setLoading(true);
      const users = [
        ...idsPromoters.map((promotor) => {
          return Number(promotor);
        }),
        ...idsSupervisors.map((supervisor) => {
          return Number(supervisor);
        }),
      ];

      const payload = {
        dataInicial: format(dateInitial, 'dd/MM/yyyy'),
        dataFinal: format(dateFinal, 'dd/MM/yyyy'),
        usuariosAgenda: users,
      };

      if (JSON.stringify(payload) === currentFilters) {
        setLoading(false);
        return dataReport
      }

      const res = await api.post(
        `v1/tradereport/kmdriven/${dataCompany.empresaAtiva}/${dataCompany.usuarioAtivo}`,
        payload
        );

        const { data } = res.data;

        if (haveData(data)) {
        setCurrentFilters(JSON.stringify(payload))
        const result = {
          summary: [],
          data: data
        }
        const users = [];
        data.forEach((item) => {
          const exist = users.findIndex((e) => e.USR_ID === item.GKM_USR_ID);

          if (exist !== -1) {
            let obj = { ...users[exist] };

            if (item.GKM_KM_FINAL) {
              obj.GKM_KM_TOTAL += item.GKM_KM_FINAL - item.GKM_KM_INICIAL;
            }
            users[exist] = obj;
          } else {
            const obj = {
              DATA: item.GKM_DATA,
              USR_ID: item.GKM_USR_ID,
              USR_NOME: item.USR_NOME,
              GKM_KM_TOTAL: 0,
            };
            if (item.GKM_KM_FINAL) {
              obj.GKM_KM_TOTAL += item.GKM_KM_FINAL - item.GKM_KM_INICIAL;
            }
            users.push(obj);
          }
        });
        result.summary = users;
        setDataReport(result)
        return result;
      }
    } catch (error) {
      alerta('Não foi possível gerar o relatório');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReportSheets() {
    const res = await handleCreateReport();

    if (res) {
      const file = [];

      let dataParse = res.data?.sort(function (a, b) {
        return compareAsc(new Date(a.GKM_DATA), new Date(b.GKM_DATA))
      })

      dataParse = dataParse.sort((a, b) => a.GKM_USR_ID - b.GKM_USR_ID);

      dataParse.forEach((item) => {
        const newObj = {
          DATA: formatDateTimeToBr(item.GKM_DATA, 'DD/MM/YYYY'),
          MATRICULA: item.GKM_USR_ID,
          COLABORADOR: `${item.GKM_USR_ID} - ${item.USR_NOME}`,
          'KM INICIAL': item.GKM_KM_INICIAL,
          'KM FINAL': item.GKM_KM_FINAL,
          'KM/DIA': item.GKM_KM_FINAL - item.GKM_KM_INICIAL,
          'FOTO INICIAL': item.GKM_KM_INICIAL_FOTO,
          'FOTO FINAL': item.GKM_KM_FINAL_FOTO,
        };
        file.push(newObj);
      });

      file.push({
        DATA: "-",
        MATRICULA: "-",
        COLABORADOR: "-",
        'KM INICIAL': "-",
        'KM FINAL': "-",
        'KM/DIA': "-",
        'FOTO INICIAL': "-",
        'FOTO FINAL': "-",
      }, {
        DATA: "-",
        MATRICULA: "TOTAIS",
        COLABORADOR: "-",
        'KM INICIAL': "-",
        'KM FINAL': "-",
        'KM/DIA': "-",
        'FOTO INICIAL': "-",
        'FOTO FINAL': "-",
      })

      res.summary.forEach((item) => {
        const newObj = {
          DATA: "-",
          MATRICULA: item.USR_ID,
          COLABORADOR: `${item.USR_NOME} - KM TOTAIS: ${item.GKM_KM_TOTAL}`,
          'KM INICIAL': "-",
          'KM FINAL': "-",
          'KM/DIA': "-",
          'FOTO INICIAL': "-",
          'FOTO FINAL': "-",
        }
        file.push(newObj);
      });

      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(file);
      var wscols = [
        { wch: 12 },
        { wch: 10 },
        { wch: 45 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 32 },
        { wch: 32 },
      ];
      ws['!cols'] = wscols;
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório de km rodados');
      XLSX.writeFile(wb, 'RelatórioKM.xlsx');
    }
  }

  async function handleCreateReportPDF() {
    const res = await handleCreateReport();

    if (res) {
      let dataParse = res.data?.sort(function (a, b) {
        return compareAsc(new Date(a.GKM_DATA), new Date(b.GKM_DATA))
      })

      dataParse = dataParse.sort((a, b) => a.GKM_USR_ID - b.GKM_USR_ID);

      if (!imagesEnable) {
        const file = { summary: res.summary, data: [] };
        const arrayAux = [];

        dataParse.forEach((item) => {
          const newObj = {
            DATA: formatDateTimeToBr(item.GKM_DATA, 'DD/MM/YYYY'),
            MATRICULA: item.GKM_USR_ID,
            COLABORADOR: `${item.GKM_USR_ID} - ${item.USR_NOME}`,
            KM_INICIAL: item.GKM_KM_INICIAL,
            KM_FINAL: item.GKM_KM_FINAL,
            KM_DIA: item.GKM_KM_FINAL ? item.GKM_KM_FINAL - item.GKM_KM_INICIAL : '',
          };
          arrayAux.push(newObj);
        });

        file.data = arrayAux;

        setDataReportPDF(file);
      } else {
        const file = { summary: res.summary, data: dataParse };
        setDataReportPDF(file);
      }
    }
  }

  const gerarImpressao = useReactToPrint({
    content: () => componentImpressaoRef.current,
    pageStyle: '@page {margin: 10mm;} @media print { body { -webkit-print-color-adjust: exact; } }',
  });

  useEffect(() => {
    if (dataReportPDF) {
      gerarImpressao();
    }
    // eslint-disable-next-line
  }, [dataReportPDF]);

  useEffect(() => {
    (async function load() {
      await carregarVariaveisEstado();
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Header />
      <WaitScreen loading={loading} />
      <Container>
        <DirectTituloJanela
          urlVoltar={'/home'}
          // urlNovo={'/search'}
          titulo={
            loading ? (
              'Aguarde...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>print</Icon>Relatório de KM rodados
              </span>
            )
          }
        />
        <div style={{ margin: '0 0.4rem' }}>
          <ContentBodyCollapsible>
            <RowFilter flex="4 !important">
              <Linha className="rowOptions">
                <DataFilter>
                  <Calendar
                    date={dateInitial}
                    onChange={(date) => {
                      setDateInitial(date);
                    }}
                  />

                  <Calendar
                    date={dateFinal}
                    onChange={(date) => {
                      setDateFinal(date);
                    }}
                  />

                  <Icon tiny>autorenew</Icon>
                </DataFilter>
              </Linha>
              <Linha withPadding={false}>
                <DivDetalhe flex={3} className="divDetailSupervisor">
                  <Labels>Supervisor</Labels>
                  <Chip
                    id="supervisoresChips"
                    className="supervisoresChips"
                    close={false}
                    closeIcon={<Icon className="close">close</Icon>}
                    options={{
                      data: selecionadosSup !== undefined ? selecionadosSup : [],
                      onChipAdd: onChangeSelectSupervisor,
                      onChipDelete: onChangeSelectSupervisor,
                      autocompleteOptions: {
                        data: supervisorsChip,
                        limit: 1,
                        onAutocomplete: function noRefCheck() {},
                      },
                    }}
                  />
                </DivDetalhe>
                <DivDetalhe flex={3} className="divDetailPromoter">
                  <Labels>Promotor</Labels>
                  <Chip
                    id="promotoresChips"
                    className="promotoresChips"
                    close={false}
                    closeIcon={<Icon className="close">close</Icon>}
                    options={{
                      data: selecionadosPromo !== undefined ? selecionadosPromo : [],
                      onChipAdd: onChangeSelectPromoter,
                      onChipDelete: onChangeSelectPromoter,
                      autocompleteOptions: {
                        data: promotoresChip,
                        limit: 1,
                        onAutocomplete: function noRefCheck() {},
                      },
                    }}
                  />
                </DivDetalhe>
              </Linha>
              <Linha>
                <Checkbox
                  id="Checkbox_imagens_report"
                  label={'Exibir imagens'}
                  value={String(imagesEnable)}
                  checked={imagesEnable && imagesEnable === 1 ? true : false}
                  onClick={(event) => {
                    if (event.target.checked) {
                      setImagesEnable(true);
                    } else {
                      setImagesEnable(false);
                    }
                  }}
                />
              </Linha>
            </RowFilter>
          </ContentBodyCollapsible>
          <Linha style={{ justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="saib-button is-primary print" onClick={handleCreateReportPDF}>
              <Icon>picture_as_pdf</Icon>
              <span>Gerar PDF</span>
            </button>
            <button className="saib-button is-primary print" onClick={handleCreateReportSheets}>
              <SiGooglesheets size={16} />
              <span>Gerar planilha</span>
            </button>
          </Linha>
        </div>
        <div style={{ display: 'none' }}>
          {dataReportPDF && (
            <ComponentToPrint
              ref={componentImpressaoRef}
              data={dataReportPDF}
              dataCompany={dataCompany}
              imagesEnable={imagesEnable}
              dateInitial={dateInitial}
              dateFinal={dateFinal}
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default withRouter(KmDrivenReport);
