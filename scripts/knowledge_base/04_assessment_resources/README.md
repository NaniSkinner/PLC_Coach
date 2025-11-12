---
title: "Mock Assessment Data Resources README"
type: "reference"
topics: ["assessment data", "CFA examples", "data analysis practice"]
author: "PLC Implementation Framework"
publication_year: 2024
document_type: "reference"
---

# Mock Assessment Data Resources

## Purpose

This directory contains realistic mock Common Formative Assessment (CFA) data files that can be used for:
- Practicing data analysis protocols
- Training teams on data interpretation
- Demonstrating the AI PLC Coach's data analysis capabilities
- Teaching item-level analysis

## Available Data Files

### 1. Grade 3 Math: Fractions CFA

**File:** `grade3_math_fractions_cfa_data.csv`

**Context:**
- Assessment: 8-item CFA on fraction concepts
- Grade level: 3rd grade
- Teachers: 3 teachers (Ms. Johnson, Mr. Peterson, Mrs. Chen)
- Students: 54 total students
- Proficiency threshold: 75% (6/8 items correct)

**Assessment Items:**
- Item 1: Identify fractions on number line (Easy - 100% correct)
- Item 2: Compare fractions with like denominators (Moderate - 76% correct)
- Item 3: Compare fractions with unlike denominators (Challenging - 65% correct)
- Item 4: Equivalent fractions visual models (Challenging - 48% correct)
- Item 5: Add fractions with like denominators (Moderate - 78% correct)
- Item 6: Shade fraction of shape (Easy - 83% correct)
- Item 7: Word problem with fractions (Moderate - 80% correct)
- Item 8: Create equivalent fraction (Challenging - 46% correct)

**Key Patterns for Analysis:**
- **Overall proficiency by teacher:**
  - Ms. Johnson: 61% proficient (11/18 students)
  - Mr. Peterson: 28% proficient (5/18 students)
  - Mrs. Chen: 89% proficient (16/18 students)
- **Item-level patterns:**
  - Items 4 and 8 (equivalent fractions) are weakest
  - Item 1 shows all students can identify basic fractions
  - Significant variation across teachers suggests instructional differences

**Coaching Discussion Points:**
- Why such variation in teacher results? What's Mrs. Chen doing differently?
- Items 4 and 8 both assess equivalent fractions - is this a concept that needs re-teaching?
- Mr. Peterson's students struggling significantly - what support does he need?

---

### 2. Grade 7 ELA: Argument Writing CFA

**File:** `grade7_ela_argument_writing_cfa_data.csv`

**Context:**
- Assessment: Argument essay scored on 5-point rubric (5 criteria)
- Grade level: 7th grade
- Teachers: 3 teachers (Mr. Adams, Ms. Rodriguez, Mr. Thompson)
- Students: 45 total students
- Proficiency threshold: 15/20 points (75%)

**Rubric Criteria (each scored 1-4 points):**
1. **Claim_Score:** Clear, arguable claim statement
2. **Evidence_Score:** Relevant, sufficient textual evidence
3. **Reasoning_Score:** Explains how evidence supports claim
4. **Organization_Score:** Logical structure, transitions
5. **Conventions_Score:** Grammar, spelling, punctuation

**Key Patterns for Analysis:**
- **Overall proficiency by teacher:**
  - Mr. Adams: 53% proficient (8/15 students)
  - Ms. Rodriguez: 80% proficient (12/15 students)
  - Mr. Thompson: 20% proficient (3/15 students)
- **Criterion-level patterns:**
  - Reasoning_Score is weakest across all teachers (avg 2.3/4)
  - Evidence_Score also relatively weak (avg 2.5/4)
  - Organization and Conventions relatively stronger

**Coaching Discussion Points:**
- Reasoning (explaining how evidence supports claims) is weak school-wide - needs focus
- Ms. Rodriguez's students scoring well on Evidence and Reasoning - what's her approach?
- Mr. Thompson's students struggling across all criteria - systemic issue?
- Should team explicitly teach "claim-evidence-reasoning" structure?

---

## How to Use These Data Files

### For Data Analysis Practice

1. **Import into spreadsheet** (Google Sheets, Excel)
2. **Calculate summary statistics:**
   - Overall proficiency rate
   - Proficiency by teacher
   - Proficiency by item/criterion
   - Item difficulty (% correct per item)
3. **Create visualizations:**
   - Bar charts comparing teacher results
   - Item analysis showing which questions were hardest
   - Student performance distributions

### For Protocol Practice

Use these data files with the **Data Analysis Protocol** (see Implementation Guides):
1. Individual prediction (predict results before looking)
2. Silent data observation
3. Collaborative observation (what do we notice?)
4. Analysis (why these results?)
5. Action planning (what will we do?)

### For Training AI PLC Coach

These data demonstrate realistic scenarios the chatbot should help teams analyze:
- Identifying patterns in student performance
- Recognizing instructional differences across teachers
- Determining which concepts need re-teaching
- Planning targeted interventions

---

## Creating Additional Mock Data

If you need additional data files, follow these patterns:

**Elementary Math CFA Structure:**
```csv
Student_ID,Teacher,Item_1,Item_2,...Item_N,Total_Score,Percent,Proficient
```

**Secondary Writing/Performance Task Structure:**
```csv
Student_ID,Teacher,Criterion_1,Criterion_2,...Criterion_N,Total_Score,Proficient
```

**Key Principles:**
- Include 45-60 students (realistic grade-level team size)
- Have 2-4 teachers with varying results (creates analysis opportunities)
- Include item-level or criterion-level data (not just total scores)
- Create realistic patterns (some items harder than others, some teachers more effective)
- Proficiency threshold typically 75-80%

---

## Notes for Developers

These mock data files can be:
- **Uploaded to vector database** for retrieval during coaching conversations
- **Used in example queries** to demonstrate chatbot capabilities
- **Referenced in prompts** when user asks "show me how to analyze data"
- **Basis for generating visualizations** if chatbot has data viz capabilities

**Privacy Note:** All data is completely fictitious. No real student or teacher information is included.

---

## Future Additions

Potential additional mock data files to create:
- High school Algebra 1 quadratic equations CFA
- Elementary reading comprehension CFA
- Middle school science lab performance task
- Multiple CFAs showing progress over time (Unit 1, Unit 2, Unit 3)
- Intervention progress monitoring data
- Benchmark assessment results

---

## Questions or Issues

If you need:
- Additional mock data files
- Different formats or structures
- Help interpreting these data patterns
- Integration with AI PLC Coach

Contact the development team or refer to the Knowledge Base documentation.
