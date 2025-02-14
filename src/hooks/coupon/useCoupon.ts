import {
  useDeleteCoupon,
  useEditCoupon,
  useGetCoupon,
  usePurchaseAdditionalCoupon,
} from '@queries/coupon';
import { Modal, message } from 'antd';
import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { CouponData, PurchaseCoupons, PurchaseData } from './type';
import {
  CouponDeleteParams,
  CouponEditParams,
  EditCoupon,
  PurchaseCouponParams,
  coupon,
  coupons,
} from '@api/coupon/type';
import { calculatedCouponPoints } from '@/utils/discountCoupon';
import { useParams } from 'react-router-dom';
import { RESPONSE_CODE } from '@/constants/api';
import { useRecoilState } from 'recoil';
import { isCouponModifiedState } from '@stores/coupon/atom';
/**
 * @description 쿠폰 관리 페이지 로직을 다루는 hook
 * 
 * @returns
 *  data,
    isGetCouponError,
    deleteCoupon,
    couponData,
    handleSelectStatus,
    handleSelectRecord,
    handleSelectCouponType,
    handleChangeDayLimit,
    handleDeleteButton,
    isModified,
    handleChangeDate,
 */

export const useCoupon = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [couponData, setCouponData] = useState<CouponData>({
    expiry: '',
    coupons: [],
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const originCouponTableData = useRef<CouponData>();
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    batchValue: 0,
    isAppliedBatchEdit: false,
    totalPoints: 0,
    rooms: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { accommodationId } = useParams();
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isCouponModified, setIsCouponModified] = useRecoilState(
    isCouponModifiedState,
  );
  const [isAgreed, setIsAgreed] = useState(false);

  const {
    data,
    isLoading: isGetCouponLoading,
    remove: getCouponRemove,
    error,
  } = useGetCoupon(accommodationId as string, {
    select(data) {
      return data.data;
    },
  });
  const { mutate: deleteCoupon } = useDeleteCoupon({
    onSuccess() {
      message.success('삭제되었습니다');
      getCouponRemove();
    },
    onError(error) {
      if (error instanceof AxiosError)
        message.error('요청에 실패했습니다 잠시 후 다시 시도해주세요');
    },
  });

  const { mutate: editCoupon } = useEditCoupon({
    onSuccess() {
      message.success('저장되었습니다');
      getCouponRemove();
    },
    onError(error) {
      if (error instanceof AxiosError)
        message.error('요청에 실패했습니다 잠시 후 다시 시도해주세요');
    },
  });

  const { mutate: purchaseAdditionalCoupon } = usePurchaseAdditionalCoupon({
    onSuccess() {
      message.success('쿠폰이 발급되었습니다');
      getCouponRemove();
      setIsModalOpen(false);
    },
    onError(error) {
      if (!(error instanceof AxiosError)) return;
      if (
        error.response?.data.code === RESPONSE_CODE.INSUFFICIENT_POINT_BALANCE
      ) {
        Modal.confirm({
          title: '포인트 잔액이 부족합니다.',
          content: '포인트를 충전하시겠습니까?',
          cancelText: '취소',
          okText: '충전',
          className: 'confirm-modal',
          onOk: () => setIsPointModalOpen(true),
        });
      } else {
        message.error('요청에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    },
  });

  useEffect(() => {
    if (data) {
      processCouponTableData(data);
      setSelectedStatus('');
      setSelectedRowKeys([]);
      return;
    }
  }, [data]);

  useEffect(() => {
    processPurchaseData();
    setIsAgreed(false);
  }, [isModalOpen]);

  useEffect(() => {
    setSelectedStatus('');
    setSelectedRowKeys([]);
    setCouponData({
      expiry: '',
      coupons: [],
    });
    setPurchaseData({
      batchValue: 0,
      isAppliedBatchEdit: false,
      totalPoints: 0,
      rooms: [],
    });
    originCouponTableData.current = {
      expiry: '',
      coupons: [],
    };
    getCouponRemove();
  }, [accommodationId]);

  useEffect(() => {
    setIsCouponModified(
      JSON.stringify(originCouponTableData.current) !==
        JSON.stringify(couponData),
    );
  }, [couponData]);

  useEffect(() => {
    return () => {
      setIsCouponModified(false);
    };
  }, []);

  const processCouponTableData = (data: coupons) => {
    const couponTableData = [];
    const originData = [];
    let key = -1;
    for (const room of data.rooms) {
      for (let index = 0; index < room.coupons.length; index++) {
        key++;
        const coupon = room.coupons[index];
        const length = index === 0 ? room.coupons.length : 0;
        couponTableData.push({
          room: {
            name: room.roomName,
            price: room.roomPrice,
            id: room.roomId,
            length,
          },
          key,
          couponId: coupon.couponId,
          status: coupon.status,
          info: {
            name: coupon.couponName,
            appliedPrice: coupon.appliedPrice,
          },
          dayLimit: coupon.dayLimit,
          quantity: coupon.quantity,
          couponType: coupon.couponType,
          discount: coupon.discount,
          discountType: coupon.discountType,
          isSoldOut: coupon.status === 'SOLD_OUT',
        });
        originData.push({
          room: {
            name: room.roomName,
            price: room.roomPrice,
            id: room.roomId,
            length,
          },
          key,
          couponId: coupon.couponId,
          status: coupon.status,
          info: {
            name: coupon.couponName,
            appliedPrice: coupon.appliedPrice,
          },
          dayLimit: coupon.dayLimit,
          quantity: coupon.quantity,
          couponType: coupon.couponType,
          discount: coupon.discount,
          discountType: coupon.discountType,
          isSoldOut: coupon.status === 'SOLD_OUT',
        });
      }
    }
    setCouponData({ expiry: data.expiry, coupons: [...couponTableData] });
    originCouponTableData.current = {
      expiry: data.expiry,
      coupons: [...originData],
    };
  };

  const processPurchaseData = () => {
    const data: PurchaseData = {
      batchValue: 0,
      totalPoints: 0,
      isAppliedBatchEdit: false,
      rooms: [],
    };
    for (let index = 0; index < selectedRowKeys.length; index++) {
      const key = selectedRowKeys[index];
      const {
        room,
        discount,
        discountType,
        info,
        couponId,
        status,
        dayLimit,
        couponType,
      } = couponData.coupons[key];
      if (!data.rooms[room.id]) {
        data.rooms[room.id] = {
          roomId: room.id,
          roomName: room.name,
          coupons: [],
        };
      }
      data.rooms[room.id].coupons.push({
        couponName: info.name,
        points: calculatedCouponPoints(room.price, discount, discountType),
        buyQuantity: 0,
        eachPoint: 0,
        couponId,
        status,
        discount,
        discountType,
        couponType,
        dayLimit,
      });
    }
    setPurchaseData(data);
  };

  const handleSelectStatus = (value: string) => {
    setSelectedStatus(value);
    const { expiry, coupons: data } = { ...couponData };
    selectedRowKeys.map((key) => {
      if (!data[key].isSoldOut) data[key].status = value;
    });
    setCouponData({ expiry, coupons: data });
  };

  const handleSelectRecord = (selectedRowKeys: number[]) => {
    const { expiry, coupons: data } = { ...couponData };
    selectedRowKeys.map((key) => {
      if (!data[key].isSoldOut && selectedStatus !== '') {
        data[key].status = selectedStatus;
      }
    });
    setCouponData({ expiry, coupons: data });
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleSelectCouponType = (value: string, key: number) => {
    const { expiry, coupons: data } = { ...couponData };
    data[key].couponType = value;
    setCouponData({ expiry, coupons: data });
  };

  const handleChangeDayLimit = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: number,
  ) => {
    const value = parseInt(event.currentTarget.value);
    if (value > 99 || value < 1) return;
    const { expiry, coupons: data } = { ...couponData };
    if (Number.isNaN(value)) data[key].dayLimit = -1;
    else data[key].dayLimit = value;
    setCouponData({ expiry, coupons: data });
  };

  const handleChangeDate = (date: string) => {
    const { coupons } = { ...couponData };
    setCouponData({ expiry: date, coupons });
  };

  const isSelectedRow = () => {
    return selectedRowKeys.length !== 0;
  };

  const findNotSoldOutData = (selectedRowKeys: number[]) => {
    for (let index = 0; index < selectedRowKeys.length; index++) {
      const key = selectedRowKeys[index];
      if (!couponData.coupons[key].isSoldOut) return true;
    }
    return false;
  };

  const processDeleteData = (selectedRowKeys: number[]) => {
    const rooms: { couponId: number }[][] = [];
    for (let index = 0; index < selectedRowKeys.length; index++) {
      const key = selectedRowKeys[index];
      const { room, couponId } = couponData.coupons[key];
      if (!rooms[room.id]) {
        rooms[room.id] = [];
      }
      rooms[room.id].push({ couponId });
    }
    const data: CouponDeleteParams = {
      accommodationId: Number(accommodationId as string),
      rooms: [],
    };
    for (let index = 0; index < rooms.length; index++) {
      if (rooms[index]) {
        const roomsData = {
          roomId: index,
          coupons: rooms[index],
        };
        data.rooms.push(roomsData);
      }
    }
    return data;
  };

  const processEditData = () => {
    const rooms: EditCoupon[][] = [];
    for (let index = 0; index < couponData.coupons.length; index++) {
      const {
        room,
        couponId,
        status,
        discount,
        discountType,
        dayLimit,
        couponType,
      } = couponData.coupons[index];
      if (!rooms[room.id]) {
        rooms[room.id] = [];
      }
      rooms[room.id].push({
        couponId,
        status,
        discount,
        discountType,
        dayLimit,
        couponType,
      });
    }
    const data: CouponEditParams = {
      accommodationId: Number(accommodationId as string),
      expiry: couponData.expiry,
      rooms: [],
    };
    for (let index = 0; index < rooms.length; index++) {
      if (rooms[index]) {
        data.rooms.push({
          roomId: index,
          coupons: rooms[index],
        });
      }
    }
    return data;
  };

  const handleDeleteButton = () => {
    if (isCouponModified) {
      message.warning('수정 중인 내용을 먼저 저장하세요');
      return;
    }
    if (!isSelectedRow()) {
      message.warning('삭제할 쿠폰을 먼저 선택하세요');
      return;
    }
    if (findNotSoldOutData(selectedRowKeys)) {
      Modal.confirm({
        title: '수량이 남아있는 쿠폰이 있습니다.',
        content: ' 삭제 후 복구할 수 없습니다. 삭제하시겠습니까?',
        cancelText: '취소',
        okText: '삭제',
        className: 'confirm-modal',
        onOk: () => {
          deleteCoupon(processDeleteData(selectedRowKeys));
        },
      });
      return;
    }
    Modal.confirm({
      title: '삭제된 쿠폰 정보는 되돌릴 수 없습니다.',
      content: ' 삭제하시겠습니까?',
      cancelText: '취소',
      okText: '삭제',
      className: 'confirm-modal',
      onOk: () => {
        deleteCoupon(processDeleteData(selectedRowKeys));
      },
    });
  };

  const handleEditButton = () => {
    Modal.confirm({
      title:
        '수정사항은 새로운 예약에만 적용되며,\n 기존 예약은 변경되지 않습니다.',
      content: ' 저장하시겠습니까?',
      cancelText: '취소',
      okText: '저장',
      className: 'confirm-modal',
      onOk: () => {
        editCoupon(processEditData());
      },
    });
  };

  const handleModalOpen = () => {
    if (isCouponModified) {
      message.warning('수정 중인 내용을 먼저 저장하세요');
      return;
    }
    if (!isSelectedRow()) {
      message.warning('구매할 쿠폰을 먼저 선택하세요');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const validateBuyQuantity = (value: number, coupon: PurchaseCoupons) => {
    if (value > 999 || value < 0) return;
    if (Number.isNaN(value)) coupon.buyQuantity = 0;
    else coupon.buyQuantity = value;
  };

  const validateBatchValue = (value: number, data: PurchaseData) => {
    if (value > 999 || value < 0) return;
    if (Number.isNaN(value)) data.batchValue = 0;
    else data.batchValue = value;
  };

  const handleBatchUpdate = (data: PurchaseData) => {
    for (const room of data.rooms) {
      if (!room) continue;
      for (const coupon of room.coupons) {
        coupon.buyQuantity = data.batchValue;
        coupon.eachPoint = coupon.points * coupon.buyQuantity;
        data.totalPoints += coupon.eachPoint;
      }
    }
    setPurchaseData(data);
  };

  const handleBatchEditCheckbox = () => {
    if (!purchaseData) return;
    const data = { ...purchaseData };
    data.isAppliedBatchEdit = !purchaseData.isAppliedBatchEdit;
    data.batchValue = 0;
    data.totalPoints = 0;
    handleBatchUpdate(data);
  };

  const handleChangeBatchValue = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!purchaseData) return;
    const data = { ...purchaseData };
    validateBatchValue(parseInt(event.currentTarget.value), data);
    data.totalPoints = 0;
    handleBatchUpdate(data);
  };

  const handleChangeBuyQuantity = (
    event: React.ChangeEvent<HTMLInputElement>,
    couponId: number,
    roomId: number,
  ) => {
    if (!purchaseData) return;
    const data = { ...purchaseData };
    data.totalPoints = 0;
    for (const room of data.rooms) {
      if (!room) continue;
      for (const coupon of room.coupons) {
        if (coupon.couponId === couponId && room.roomId === roomId) {
          validateBuyQuantity(parseInt(event.currentTarget.value), coupon);
          coupon.eachPoint = coupon.points * coupon.buyQuantity;
        }
        data.totalPoints += coupon.eachPoint;
      }
    }
    setPurchaseData(data);
  };

  const processPurchasePostData = () => {
    const data: PurchaseCouponParams = {
      accommodationId: Number(accommodationId as string),
      totalPoints: purchaseData.totalPoints,
      expiry: couponData.expiry,
      rooms: [],
    };
    const roomData: PurchaseCouponParams['rooms'] = [];
    for (let index = 0; index < purchaseData.rooms.length; index++) {
      const room = purchaseData.rooms[index];
      if (!room) continue;
      const coupons: (Omit<
        coupon,
        'couponName' | 'appliedPrice' | 'quantity'
      > & {
        eachPoint: number;
        buyQuantity: number;
      })[] = [];
      for (const coupon of room.coupons) {
        coupons.push({
          couponId: coupon.couponId,
          status: coupon.status,
          discount: coupon.discount,
          discountType: coupon.discountType,
          couponType: coupon.couponType,
          eachPoint: coupon.eachPoint,
          dayLimit: coupon.dayLimit,
          buyQuantity: coupon.buyQuantity,
        });
      }
      roomData.push({
        roomId: room.roomId,
        coupons,
      });
    }
    data.rooms = roomData;
    return data;
  };
  const handlePurchaseButton = () => {
    Modal.confirm({
      content: '쿠폰을 구매하시겠습니까?',
      cancelText: '취소',
      okText: '구매',
      className: 'confirm-modal',
      onOk: () => {
        purchaseAdditionalCoupon(processPurchasePostData());
      },
    });
  };

  const handleAgreeCheckbox = () => {
    setIsAgreed((prev) => !prev);
  };

  return {
    deleteCoupon,
    couponData,
    handleSelectStatus,
    handleSelectRecord,
    handleSelectCouponType,
    handleChangeDayLimit,
    handleDeleteButton,
    handleChangeDate,
    handleEditButton,
    handleModalOpen,
    handleModalClose,
    isModalOpen,
    handleBatchEditCheckbox,
    purchaseData,
    handleChangeBatchValue,
    handleChangeBuyQuantity,
    handlePurchaseButton,
    isPointModalOpen,
    setIsPointModalOpen,
    isGetCouponLoading,
    handleAgreeCheckbox,
    isAgreed,
    error,
  };
};
