alter table public.permits
add column if not exists priority_score int not null default 0;

alter table public.permits
add column if not exists priority_label text not null default 'Low';

alter table public.permits
drop constraint if exists permits_priority_label_check;

alter table public.permits
add constraint permits_priority_label_check
check (priority_label in ('Hot', 'Warm', 'Low'));

update public.permits
set
  priority_score =
    (
      case
        when issued_date is null then 0
        when issued_date >= now() - interval '7 days' then 30
        when issued_date >= now() - interval '30 days' then 20
        when issued_date >= now() - interval '90 days' then 10
        else 0
      end
    ) +
    (
      case
        when contractor_name ilike '%INC%'
          or contractor_name ilike '%CORP%'
          or contractor_name ilike '%LLC%'
          or contractor_name ilike '%GROUP%'
          or contractor_name ilike '%CONSTRUCTION%'
        then 25
        else 10
      end
    ) +
    (
      case
        when status ilike '%EXPIRED%' then 0
        when status ilike '%ACTIVE%'
          or status ilike '%ISSUED%'
          or status ilike '%OPEN%'
          or status ilike '%PENDING%'
        then 20
        when status ilike '%FINAL%'
          or status ilike '%FINALIZED%'
          or status ilike '%COMPLETE%'
          or status ilike '%COMPLETED%'
          or status ilike '%CLOSED%'
        then 10
        else 10
      end
    ) +
    (
      case
        when address ilike '%BRICKELL%'
          or address ilike '%MIAMI BEACH%'
          or address ilike '%CORAL GABLES%'
          or address ilike '%DOWNTOWN%'
          or address ilike '%DORAL%'
          or address ilike '%AVENTURA%'
        then 15
        when address ilike '% NW %'
          or address ilike '% NE %'
          or address ilike '% SW %'
          or address ilike '% SE %'
        then 8
        else 5
      end
    ) +
    (
      case
        when coalesce(estimated_value, 0) > 100000 then 10
        when coalesce(estimated_value, 0) > 10000 then 5
        else 0
      end
    ),
  priority_label =
    case
      when
        (
          (
            case
              when issued_date is null then 0
              when issued_date >= now() - interval '7 days' then 30
              when issued_date >= now() - interval '30 days' then 20
              when issued_date >= now() - interval '90 days' then 10
              else 0
            end
          ) +
          (
            case
              when contractor_name ilike '%INC%'
                or contractor_name ilike '%CORP%'
                or contractor_name ilike '%LLC%'
                or contractor_name ilike '%GROUP%'
                or contractor_name ilike '%CONSTRUCTION%'
              then 25
              else 10
            end
          ) +
          (
            case
              when status ilike '%EXPIRED%' then 0
              when status ilike '%ACTIVE%'
                or status ilike '%ISSUED%'
                or status ilike '%OPEN%'
                or status ilike '%PENDING%'
              then 20
              when status ilike '%FINAL%'
                or status ilike '%FINALIZED%'
                or status ilike '%COMPLETE%'
                or status ilike '%COMPLETED%'
                or status ilike '%CLOSED%'
              then 10
              else 10
            end
          ) +
          (
            case
              when address ilike '%BRICKELL%'
                or address ilike '%MIAMI BEACH%'
                or address ilike '%CORAL GABLES%'
                or address ilike '%DOWNTOWN%'
                or address ilike '%DORAL%'
                or address ilike '%AVENTURA%'
              then 15
              when address ilike '% NW %'
                or address ilike '% NE %'
                or address ilike '% SW %'
                or address ilike '% SE %'
              then 8
              else 5
            end
          ) +
          (
            case
              when coalesce(estimated_value, 0) > 100000 then 10
              when coalesce(estimated_value, 0) > 10000 then 5
              else 0
            end
          )
        ) >= 70
      then 'Hot'
      when
        (
          (
            case
              when issued_date is null then 0
              when issued_date >= now() - interval '7 days' then 30
              when issued_date >= now() - interval '30 days' then 20
              when issued_date >= now() - interval '90 days' then 10
              else 0
            end
          ) +
          (
            case
              when contractor_name ilike '%INC%'
                or contractor_name ilike '%CORP%'
                or contractor_name ilike '%LLC%'
                or contractor_name ilike '%GROUP%'
                or contractor_name ilike '%CONSTRUCTION%'
              then 25
              else 10
            end
          ) +
          (
            case
              when status ilike '%EXPIRED%' then 0
              when status ilike '%ACTIVE%'
                or status ilike '%ISSUED%'
                or status ilike '%OPEN%'
                or status ilike '%PENDING%'
              then 20
              when status ilike '%FINAL%'
                or status ilike '%FINALIZED%'
                or status ilike '%COMPLETE%'
                or status ilike '%COMPLETED%'
                or status ilike '%CLOSED%'
              then 10
              else 10
            end
          ) +
          (
            case
              when address ilike '%BRICKELL%'
                or address ilike '%MIAMI BEACH%'
                or address ilike '%CORAL GABLES%'
                or address ilike '%DOWNTOWN%'
                or address ilike '%DORAL%'
                or address ilike '%AVENTURA%'
              then 15
              when address ilike '% NW %'
                or address ilike '% NE %'
                or address ilike '% SW %'
                or address ilike '% SE %'
              then 8
              else 5
            end
          ) +
          (
            case
              when coalesce(estimated_value, 0) > 100000 then 10
              when coalesce(estimated_value, 0) > 10000 then 5
              else 0
            end
          )
        ) >= 40
      then 'Warm'
      else 'Low'
    end;

create index if not exists permits_priority_score_idx
on public.permits (priority_score desc);

create index if not exists permits_priority_label_idx
on public.permits (priority_label);
