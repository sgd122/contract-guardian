import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { AnalysisResult, RiskLevel, ClauseType } from '@cg/shared';
import { CLAUSE_TYPE_LABELS, RISK_LABELS } from '@cg/shared';

// Register Korean font (local file to avoid CDN dependency)
import path from 'path';

Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: path.join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Regular.ttf'),
      fontWeight: 400,
    },
  ],
});

// Disable word-level hyphenation for Korean text
Font.registerHyphenationCallback((word) => [word]);

const colors = {
  primary: '#1e40af',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
  bgLight: '#f9fafb',
  bgAmber: '#fffbeb',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    padding: 40,
    paddingBottom: 50,
    color: colors.text,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 8,
    color: colors.textLight,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerMeta: {
    fontSize: 8,
    color: colors.textLight,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Summary
  summaryBox: {
    backgroundColor: colors.bgLight,
    borderRadius: 6,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.white,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.white,
    marginTop: 2,
  },
  summaryDetails: {
    flex: 1,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    width: 60,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 9,
    flex: 1,
  },
  summaryText: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 1.5,
  },
  // Risk Distribution
  riskDistribution: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 9,
  },
  // Clause Card
  clauseCard: {
    marginBottom: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clauseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.bgLight,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  clauseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clauseRiskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
    color: colors.white,
  },
  clauseType: {
    fontSize: 9,
    color: colors.textLight,
  },
  clauseScore: {
    fontSize: 9,
    fontWeight: 700,
  },
  clauseBody: {
    padding: 10,
  },
  clauseOriginal: {
    fontSize: 9,
    color: colors.textLight,
    backgroundColor: colors.bgLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  clauseLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 3,
    marginTop: 6,
  },
  clauseText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.text,
  },
  clauseLaw: {
    fontSize: 8,
    color: colors.textLight,
    backgroundColor: colors.bgLight,
    padding: 6,
    borderRadius: 4,
    marginTop: 6,
  },
  // Improvement Card
  improvementCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  improvementPriority: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
  },
  improvementTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  improvementDesc: {
    fontSize: 9,
    color: colors.textLight,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  improvementSuggested: {
    backgroundColor: colors.bgLight,
    padding: 8,
    borderRadius: 4,
  },
  improvementSuggestedLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.textLight,
    marginBottom: 3,
  },
  improvementSuggestedText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Missing Clauses
  missingClauseBox: {
    backgroundColor: colors.bgAmber,
    padding: 12,
    borderRadius: 6,
  },
  missingClauseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  missingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.medium,
  },
  missingText: {
    fontSize: 9,
  },
  // Disclaimer
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.bgLight,
    borderRadius: 6,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  // Page Number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: colors.textLight,
  },
});

function getRiskColor(level: RiskLevel): string {
  return level === 'high'
    ? colors.high
    : level === 'medium'
      ? colors.medium
      : colors.low;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

interface ReportDocumentProps {
  analysis: AnalysisResult;
}

export function ReportDocument({ analysis }: ReportDocumentProps) {
  const riskLevel = analysis.overall_risk_level ?? 'low';
  const riskColor = getRiskColor(riskLevel);
  const highCount = analysis.clauses.filter((c) => c.risk_level === 'high').length;
  const mediumCount = analysis.clauses.filter((c) => c.risk_level === 'medium').length;
  const lowCount = analysis.clauses.filter((c) => c.risk_level === 'low').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.headerTitle}>계약서 지킴이</Text>
            <Text style={styles.headerSubtitle}>AI 계약서 분석 리포트</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>
              분석일: {formatDate(analysis.created_at)}
            </Text>
            <Text style={styles.headerMeta}>
              파일: {analysis.original_filename}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>종합 요약</Text>
          <View style={styles.summaryBox}>
            <View style={[styles.scoreCircle, { backgroundColor: riskColor }]}>
              <Text style={styles.scoreText}>
                {analysis.overall_risk_score ?? 0}
              </Text>
              <Text style={styles.scoreLabel}>{RISK_LABELS[riskLevel]}</Text>
            </View>
            <View style={styles.summaryDetails}>
              {analysis.contract_type && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>계약 유형</Text>
                  <Text style={styles.summaryValue}>
                    {analysis.contract_type}
                  </Text>
                </View>
              )}
              {analysis.contract_parties && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>갑 (甲)</Text>
                    <Text style={styles.summaryValue}>
                      {analysis.contract_parties.party_a}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>을 (乙)</Text>
                    <Text style={styles.summaryValue}>
                      {analysis.contract_parties.party_b}
                    </Text>
                  </View>
                </>
              )}
              {analysis.summary && (
                <Text style={styles.summaryText}>{analysis.summary}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Risk Distribution */}
        <View style={styles.riskDistribution}>
          <View style={[styles.riskBadge, { backgroundColor: '#fef2f2' }]}>
            <View style={[styles.riskDot, { backgroundColor: colors.high }]} />
            <Text style={styles.riskBadgeText}>위험 {highCount}건</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: '#fffbeb' }]}>
            <View
              style={[styles.riskDot, { backgroundColor: colors.medium }]}
            />
            <Text style={styles.riskBadgeText}>주의 {mediumCount}건</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: '#f0fdf4' }]}>
            <View style={[styles.riskDot, { backgroundColor: colors.low }]} />
            <Text style={styles.riskBadgeText}>안전 {lowCount}건</Text>
          </View>
        </View>

        {/* Clause Analysis */}
        {analysis.clauses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              조항별 분석 ({analysis.clauses.length}건)
            </Text>
            {analysis.clauses.map((clause) => (
              <View key={clause.id} style={styles.clauseCard} wrap={false}>
                <View style={styles.clauseHeader}>
                  <View style={styles.clauseHeaderLeft}>
                    <Text
                      style={[
                        styles.clauseRiskBadge,
                        { backgroundColor: getRiskColor(clause.risk_level) },
                      ]}
                    >
                      {RISK_LABELS[clause.risk_level]}
                    </Text>
                    <Text style={styles.clauseType}>
                      {CLAUSE_TYPE_LABELS[clause.clause_type] ??
                        clause.clause_type}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.clauseScore,
                      { color: getRiskColor(clause.risk_level) },
                    ]}
                  >
                    {clause.risk_score}점
                  </Text>
                </View>
                <View style={styles.clauseBody}>
                  <Text style={styles.clauseOriginal}>
                    &ldquo;{clause.original_text}&rdquo;
                  </Text>

                  <Text style={styles.clauseLabel}>분석 설명</Text>
                  <Text style={styles.clauseText}>{clause.explanation}</Text>

                  <Text style={styles.clauseLabel}>수정 제안</Text>
                  <Text style={styles.clauseText}>{clause.suggestion}</Text>

                  {clause.relevant_law && (
                    <Text style={styles.clauseLaw}>
                      관련 법령: {clause.relevant_law}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>개선 권고</Text>
            {analysis.improvements.map((improvement) => (
              <View
                key={improvement.priority}
                style={styles.improvementCard}
                wrap={false}
              >
                <View style={styles.improvementHeader}>
                  <Text style={styles.improvementPriority}>
                    우선순위 {improvement.priority}
                  </Text>
                  <Text style={styles.improvementTitle}>
                    {improvement.title}
                  </Text>
                </View>
                <Text style={styles.improvementDesc}>
                  {improvement.description}
                </Text>
                {improvement.suggested_text && (
                  <View style={styles.improvementSuggested}>
                    <Text style={styles.improvementSuggestedLabel}>
                      제안 문구
                    </Text>
                    <Text style={styles.improvementSuggestedText}>
                      {improvement.suggested_text}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Missing Clauses */}
        {analysis.missing_clauses && analysis.missing_clauses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>누락된 조항</Text>
            <View style={styles.missingClauseBox}>
              {analysis.missing_clauses.map((clause) => (
                <View key={clause} style={styles.missingClauseItem}>
                  <View style={styles.missingDot} />
                  <Text style={styles.missingText}>
                    {CLAUSE_TYPE_LABELS[clause as ClauseType] ?? clause}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer} wrap={false}>
          <Text style={styles.disclaimerText}>
            본 서비스는 AI 기반 참고 자료를 제공하며, 법률 자문을 대체하지
            않습니다.{'\n'}중요한 계약 체결 시 반드시 법률 전문가의 자문을
            받으시기 바랍니다.
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
