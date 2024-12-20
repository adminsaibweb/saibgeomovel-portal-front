import styled from 'styled-components';

export const Content = styled.div`
  display: flex;
  max-height: 100%;
  width: 100%;
  div.skeletonLoading {
    width: 15rem;
  }
`;
export const ContentCardClients = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  max-height: 100%;
  height: 5rem;
  padding: 10px;
  background: #8e44ad;
  border-radius: 10px;

  div {
    line-height: 18px;
    display: flex;
    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 700;
    }
  }
`;

export const TotalAlertsClients = styled.div`
  display: flex;
  justify-content: center;

  flex-direction: column;
  color: #fff;
  max-height: 100%;
  margin: 0 !important;
  font-weight: 700;

  span {
    text-align: center;
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 10px;
`;

export const ContentDetailsClients = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  p {
    font-size: 0.7rem;
  }
  div.details {
    display: flex;
    flex-direction: column;
  }

  div.lineDetail {
    line-height: 18px;
    display: flex;
    width: max-content;
    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 700;
      margin-right: 5px;
    }
  }
`;
