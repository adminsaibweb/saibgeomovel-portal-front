import React, { Component, Fragment } from 'react';
import { capitalize } from '../../../../../services/funcoes';
import Questions from '../Questions';
import { Linha, DivDetalhe } from './styled';

export default class GroupingQuestion extends Component {
  render() {
    const { agroupeds } = this.props;
    //console.log(agroupeds);
    return (
      <Fragment>
        <Linha>
          <DivDetalhe className="contentAllAgrupeds">
            {agroupeds.length > 0 ? (
              agroupeds.map((grouping) => (
                <Fragment key={grouping.AGRUPA_ID}>
                  <div className="contentAgroupeds">
                    {grouping.ITEMS.map((item) => (
                      <Fragment key={item.ITEM_ID}>
                        <div className="contentItens">
                          <p className="titleItem">
                            {`${capitalize(grouping.AGRUPA_DESCRICAO, true)} -> `}
                            {capitalize(item.ITEM_DESCRICAO, true)}{' '}
                          </p>

                          <Linha className="contentQuestionsAgrupeds">
                            <Questions questions={item.PERGUNTAS} />
                          </Linha>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </Fragment>
              ))
            ) : (
              <p>Sem perguntas respondidas</p>
            )}
          </DivDetalhe>
        </Linha>
      </Fragment>
    );
  }
}
