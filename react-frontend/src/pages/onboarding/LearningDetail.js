import { CButton, CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([^&]+)/,
  /(?:youtube\.com\/embed\/)([^?&/]+)/,
  /(?:youtu\.be\/)([^?&/]+)/,
  /(?:youtube\.com\/shorts\/)([^?&/]+)/,
];

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
};

const getGoogleDrivePreviewUrl = (url) => {
  if (!url || !url.includes('drive.google.com')) return null;

  const match = url.match(/\/file\/d\/([^/]+)\//);
  if (!match?.[1]) return null;

  return `https://drive.google.com/file/d/${match[1]}/preview`;
};

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '');
const isPdfPath = (url) => /\.pdf($|\?)/i.test(url || '');
const isVideoFilePath = (url) => /\.(mp4|webm|ogg)($|\?)/i.test(url || '');

const getInlineSource = (type, path) => {
  if (!path) return { mode: 'none', src: null };

  if (type === 'VIDEO') {
    const youtubeEmbedUrl = getYoutubeEmbedUrl(path);
    if (youtubeEmbedUrl) {
      return { mode: 'iframe', src: youtubeEmbedUrl };
    }

    if (isVideoFilePath(path)) {
      return { mode: 'video', src: path };
    }

    if (path.includes('youtube.com/embed')) {
      return { mode: 'iframe', src: path };
    }
  }

  if (type === 'PDF') {
    const googleDrivePreviewUrl = getGoogleDrivePreviewUrl(path);
    if (googleDrivePreviewUrl) {
      return { mode: 'iframe', src: googleDrivePreviewUrl };
    }

    if (isPdfPath(path) || !isExternalUrl(path)) {
      return { mode: 'iframe', src: path };
    }
  }

  return { mode: 'external', src: path };
};

const LearningDetail = () => {
  const { contentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, userLoading } = useUser();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageTitle = location.state?.title || '학습 상세 정보';
  const displayTitle = content?.title || pageTitle;
  const itemId = location.state?.itemId;
  const checklistId = location.state?.checklistId;

  const inlineSource = useMemo(
    () => getInlineSource(content?.type, content?.path),
    [content?.type, content?.path]
  );

  const handleCompleteLearning = async () => {
    try {
      const empNo = userInfo?.empNo;

      if (!empNo) {
        alert('사용자 정보가 없습니다.');
        return;
      }

      if (itemId) {
        await axiosInstance.post(PATH.API.ONBOARDING.PROGRESS_COMPLETE, {
          empNo,
          itemId,
        });
      }

      if (checklistId) {
        await axiosInstance.post(PATH.API.ONBOARDING.CHECKLIST_COMPLETE, {
          empNo,
          checklistId,
        });

        toast.success('학습 및 체크리스트 완료!', {
          icon: '✅',
        });

        navigate(PATH.ONBOARDING.CHECKLIST, {
          state: { updatedChecklistId: checklistId },
        });
        return;
      }

      toast.success('학습 완료!', {
        icon: '✅',
      });

      navigate(PATH.ONBOARDING.ROADMAP, {
        state: { updatedItemId: itemId },
      });
    } catch (err) {
      console.error('[LearningDetail] complete failed:', err);
      alert('학습 완료 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(PATH.API.ONBOARDING.CONTENT_DETAIL(contentId));

        if (!response.data || response.data.error) {
          setContent(null);
          setError(response.data?.error || '콘텐츠를 찾을 수 없습니다.');
          return;
        }

        setContent(response.data);
      } catch (err) {
        console.error('[LearningDetail] detail load failed:', err);
        setContent(null);
        setError('학습 콘텐츠를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [contentId]);

  if (userLoading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p>사용자 인증 확인 중...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p>학습 콘텐츠를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!userLoading && !userInfo) {
    alert('로그인이 필요한 서비스입니다.');
    navigate(PATH.AUTH.LOGIN);
    return null;
  }

  if (!content) {
    return (
      <div className="text-center py-5">
        <h4>{error || '콘텐츠를 찾을 수 없습니다.'}</h4>
        <CButton color="primary" onClick={() => navigate(-1)}>
          뒤로가기
        </CButton>
      </div>
    );
  }

  const openExternal = () => {
    window.open(content.path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={containerStyle}>
      <header
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <small className="text-muted">Onboarding Step {contentId}</small>
          <h2 style={{ fontWeight: 'bold' }}>{displayTitle}</h2>
        </div>
        <CButton color="secondary" variant="outline" onClick={() => navigate(PATH.ONBOARDING.ROADMAP)}>
          목록으로
        </CButton>
      </header>

      <CCard className="shadow-sm">
        <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
          <strong>{content.type} 학습 모드</strong>
          {content.path && inlineSource.mode === 'external' && (
            <CButton color="primary" size="sm" onClick={openExternal}>
              새 탭에서 열기
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {!content.path ? (
            <div className="py-5 text-center">
              <p>준비된 학습 자료가 없습니다. 관리자에게 문의해 주세요.</p>
            </div>
          ) : (
            <div>
              {content.type === 'VIDEO' && (
                <>
                  {inlineSource.mode === 'iframe' && (
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={inlineSource.src}
                        title="Video content"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 0, borderRadius: '8px' }}
                      />
                    </div>
                  )}

                  {inlineSource.mode === 'video' && (
                    <video
                      controls
                      style={{ width: '100%', borderRadius: '8px', background: '#000' }}
                    >
                      <source src={inlineSource.src} />
                    </video>
                  )}

                  {inlineSource.mode === 'external' && (
                    <div className="text-center py-5">
                      <h5>영상 콘텐츠를 새 탭에서 확인해 주세요.</h5>
                      <p className="text-muted small">{content.path}</p>
                      <CButton color="primary" onClick={openExternal}>
                        영상 열기
                      </CButton>
                    </div>
                  )}
                </>
              )}

              {content.type === 'PDF' && (
                <>
                  {inlineSource.mode === 'iframe' && (
                    <div style={{ height: '820px' }}>
                      <iframe
                        src={inlineSource.src}
                        title="PDF content"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '8px' }}
                      />
                    </div>
                  )}

                  {inlineSource.mode === 'external' && (
                    <div className="text-center py-5">
                      <h5>PDF 자료를 새 탭에서 확인해 주세요.</h5>
                      <p className="text-muted small">{content.path}</p>
                      <CButton color="primary" onClick={openExternal}>
                        PDF 열기
                      </CButton>
                    </div>
                  )}
                </>
              )}

              {content.type === 'LINK' && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="cil-external-link" style={{ fontSize: '3rem', color: '#321fdb' }} />
                  </div>
                  <h5>이 콘텐츠는 외부 사이트에서 제공됩니다.</h5>
                  <p className="text-muted">아래 버튼을 눌러 학습을 계속해 주세요.</p>
                  <CButton color="primary" size="lg" onClick={openExternal}>
                    외부 사이트로 이동
                  </CButton>
                </div>
              )}

              {content.type === 'QUIZ' && (
                <div className="text-center py-5">
                  <h5>퀴즈 콘텐츠입니다.</h5>
                  <p className="text-muted">아래 버튼을 눌러 퀴즈를 시작해 주세요.</p>
                  <CButton color="primary" size="lg" onClick={() => navigate(PATH.EVALUATION.QUIZ)}>
                    퀴즈 시작하기
                  </CButton>
                </div>
              )}

              {!['VIDEO', 'PDF', 'LINK', 'QUIZ'].includes(content.type) && (
                <div className="py-5 text-center">
                  <p>지원하지 않는 콘텐츠 유형입니다.</p>
                </div>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>

      <div className="mt-4 d-flex justify-content-between align-items-center">
        <p className="text-muted small mb-0">
          학습을 완료했다면 완료 버튼을 눌러 진행 상태를 반영해 주세요.
        </p>

        <CButton color="success" onClick={handleCompleteLearning} disabled={!itemId && !checklistId}>
          학습 완료
        </CButton>
      </div>
    </div>
  );
};

export default LearningDetail;
